import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PersistedTokens,
  tokenStorage,
  userStorage,
  clearAllAuth,
} from '../services/storage';
import { setAuthCallbacks, setTokens } from '../services/api';
import { login as loginRequest, register as registerRequest } from '../services/auth';
import type {
  AuthenticatedUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/api';

interface AuthContextValue {
  signed: boolean;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  tokens: PersistedTokens | null;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

function persistedTokensFromAuth(auth: AuthResponse): PersistedTokens {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: Date.now() + auth.expiresIn * 1000,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokensState] = useState<PersistedTokens | null>(null);
  const [user, setUserState] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onUnauthorizedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [storedTokens, storedUser] = await Promise.all([
          tokenStorage.load(),
          userStorage.load(),
        ]);
        if (!active) return;
        if (storedTokens) {
          setTokens(storedTokens);
          setTokensState(storedTokens);
        }
        if (storedUser) {
          setUserState(storedUser);
        }
      } catch (err) {
        // Falha ao hidratar (ex.: AsyncStorage indisponível) não pode travar
        // a UI no spinner — segue para a tela de login.
        console.warn('AuthProvider hydration failed', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAuthFailure = useCallback(() => {
    setTokensState(null);
    setUserState(null);
    setTokens(null);
    void userStorage.clear();
  }, []);

  useEffect(() => {
    onUnauthorizedRef.current = handleAuthFailure;
  }, [handleAuthFailure]);

  useEffect(() => {
    setAuthCallbacks({
      onTokensUpdated: (next) => {
        setTokensState(next);
      },
      onUnauthorized: () => {
        onUnauthorizedRef.current?.();
      },
    });
  }, []);

  const applyAuthResponse = useCallback(async (auth: AuthResponse) => {
    const next = persistedTokensFromAuth(auth);
    setTokens(next);
    setTokensState(next);
    setUserState(auth.user);
    await Promise.all([tokenStorage.save(next), userStorage.save(auth.user)]);
  }, []);

  const signIn = useCallback(
    async (payload: LoginRequest) => {
      const auth = await loginRequest(payload);
      await applyAuthResponse(auth);
    },
    [applyAuthResponse],
  );

  const signUp = useCallback(
    async (payload: RegisterRequest) => {
      const auth = await registerRequest(payload);
      await applyAuthResponse(auth);
    },
    [applyAuthResponse],
  );

  const signOut = useCallback(async () => {
    setTokensState(null);
    setUserState(null);
    setTokens(null);
    await clearAllAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      signed: !!tokens?.accessToken,
      isLoading,
      user,
      tokens,
      signIn,
      signUp,
      signOut,
    }),
    [tokens, user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const SessionContext = createContext({});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
);

export const useAuth = (): AuthContextValue => useContext(AuthContext);
