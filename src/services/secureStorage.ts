import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper de storage seguro para segredos (tokens JWT).
 *
 * - iOS/Android: usa expo-secure-store, que persiste no Keychain (iOS) /
 *   EncryptedSharedPreferences via Keystore (Android). Os tokens NUNCA ficam
 *   em texto puro no disco.
 * - Web: cai em AsyncStorage com prefixo separado. SecureStore não existe no
 *   web; nesse caso a única garantia real seria não persistir tokens — mas
 *   manter a sessão entre reloads de web também é requisito de UX.
 *
 * O require do expo-secure-store é dinâmico para que web/Expo Go funcionem
 * mesmo se o nativo não estiver linkado (cai no fallback).
 */

type SecureStoreModule = {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
};

let cachedNativeStore: SecureStoreModule | null | undefined;

function loadNativeStore(): SecureStoreModule | null {
  if (cachedNativeStore !== undefined) return cachedNativeStore;
  if (Platform.OS === 'web') {
    cachedNativeStore = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-secure-store') as SecureStoreModule;
    if (typeof mod?.setItemAsync !== 'function') {
      cachedNativeStore = null;
      return null;
    }
    cachedNativeStore = mod;
    return mod;
  } catch {
    cachedNativeStore = null;
    return null;
  }
}

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    const native = loadNativeStore();
    if (native) {
      await native.setItemAsync(key, value);
      return;
    }
    await AsyncStorage.setItem(webKey(key), value);
  },

  async getItem(key: string): Promise<string | null> {
    const native = loadNativeStore();
    if (native) {
      return native.getItemAsync(key);
    }
    return AsyncStorage.getItem(webKey(key));
  },

  async removeItem(key: string): Promise<void> {
    const native = loadNativeStore();
    if (native) {
      await native.deleteItemAsync(key);
      return;
    }
    await AsyncStorage.removeItem(webKey(key));
  },

  /** Verifica se o backend nativo seguro está ativo. Útil para diagnóstico/log. */
  isNativeAvailable(): boolean {
    return loadNativeStore() !== null;
  },
};

function webKey(key: string): string {
  return `secure-fallback:${key}`;
}
