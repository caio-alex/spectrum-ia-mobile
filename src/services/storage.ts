import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from './secureStorage';
import type { AuthenticatedUser } from '../types/api';

// Chave SecureStore: somente letras, dígitos, ".", "-", "_". Sem "@" ou "/".
const TOKENS_KEY = 'spectrum.auth.tokens';
const USER_KEY = '@spectrum/auth/user';
// Compatibilidade: chave antiga (AsyncStorage) — usada apenas na migração.
const LEGACY_TOKENS_KEY = '@spectrum/auth/tokens';

export interface PersistedTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * tokenStorage: segredos vão para SecureStore (Keychain / Keystore). No web
 * cai em AsyncStorage com prefixo separado — ver {@link secureStorage}.
 *
 * Faz migração transparente de qualquer payload herdado de versões anteriores
 * do app que ainda armazenavam tokens em AsyncStorage em texto puro.
 */
export const tokenStorage = {
  async load(): Promise<PersistedTokens | null> {
    const raw = await secureStorage.getItem(TOKENS_KEY);
    if (raw) {
      return parseTokens(raw);
    }
    // Migração one-shot: lê AsyncStorage legado, grava no SecureStore e apaga.
    const legacy = await AsyncStorage.getItem(LEGACY_TOKENS_KEY);
    if (!legacy) return null;
    const tokens = parseTokens(legacy);
    if (tokens) {
      await secureStorage.setItem(TOKENS_KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_TOKENS_KEY);
    }
    return tokens;
  },
  async save(tokens: PersistedTokens): Promise<void> {
    await secureStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },
  async clear(): Promise<void> {
    await secureStorage.removeItem(TOKENS_KEY);
    // Garante limpeza de qualquer resíduo legado.
    await AsyncStorage.removeItem(LEGACY_TOKENS_KEY);
  },
};

export const userStorage = {
  async load(): Promise<AuthenticatedUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  },
  async save(user: AuthenticatedUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },
};

export async function clearAllAuth(): Promise<void> {
  await Promise.all([tokenStorage.clear(), userStorage.clear()]);
}

function parseTokens(raw: string): PersistedTokens | null {
  try {
    const parsed = JSON.parse(raw) as PersistedTokens;
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}
