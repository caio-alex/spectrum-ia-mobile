import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthenticatedUser } from '../types/api';

const TOKENS_KEY = '@spectrum/auth/tokens';
const USER_KEY = '@spectrum/auth/user';

export interface PersistedTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const tokenStorage = {
  async load(): Promise<PersistedTokens | null> {
    const raw = await AsyncStorage.getItem(TOKENS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedTokens;
    } catch {
      return null;
    }
  },
  async save(tokens: PersistedTokens): Promise<void> {
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(TOKENS_KEY);
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
