const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://spectrum-ai-api.onrender.com';
const NORMALIZED = RAW_API_URL.replace(/\/+$/, '');

// __DEV__ é fornecido pelo Metro/Hermes. Em build de produção é false.
declare const __DEV__: boolean | undefined;
const IS_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Em produção a URL DEVE ser HTTPS. Em dev permitimos http://localhost,
 * 10.0.2.2 (Android Emulator) e IPs LAN para facilitar o desenvolvimento.
 * Demais URLs http:// são rejeitadas mesmo em dev para evitar acidente.
 */
function assertSecureUrl(url: string): void {
  if (url.startsWith('https://')) return;

  if (!url.startsWith('http://')) {
    throw new Error(`EXPO_PUBLIC_API_URL inválida: protocolo não suportado (${url}).`);
  }

  if (!IS_DEV) {
    throw new Error(
      `EXPO_PUBLIC_API_URL deve usar HTTPS em produção. Recebido: ${url}. ` +
        `Configure EXPO_PUBLIC_API_URL no .env do build de release.`,
    );
  }

  // Dev: só aceita http:// para endereços locais conhecidos
  const allowedDevHosts = /^(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i;
  const hostMatch = /^http:\/\/([^:/]+)/i.exec(url);
  const host = hostMatch?.[1] ?? '';
  if (!allowedDevHosts.test(host)) {
    throw new Error(
      `EXPO_PUBLIC_API_URL com http:// só é aceita em dev para localhost/LAN. Recebido: ${url}.`,
    );
  }
}

assertSecureUrl(NORMALIZED);

export const API_BASE_URL = NORMALIZED;
export const API_V1_URL = `${NORMALIZED}/v1`;
export const REQUEST_TIMEOUT_MS = 30000;
export const IS_DEV_BUILD = IS_DEV;
