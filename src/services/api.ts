import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import { API_V1_URL, IS_DEV_BUILD, REQUEST_TIMEOUT_MS } from '../config/env';
import { PersistedTokens, tokenStorage } from './storage';
import type { RefreshResponse } from '../types/api';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let currentTokens: PersistedTokens | null = null;
let onTokensUpdated: ((tokens: PersistedTokens | null) => void) | null = null;
let onUnauthorized: (() => void) | null = null;

let refreshInflight: Promise<string> | null = null;

export function setAuthCallbacks(opts: {
  onTokensUpdated?: (tokens: PersistedTokens | null) => void;
  onUnauthorized?: () => void;
}): void {
  onTokensUpdated = opts.onTokensUpdated ?? null;
  onUnauthorized = opts.onUnauthorized ?? null;
}

export function setTokens(tokens: PersistedTokens | null): void {
  currentTokens = tokens;
}

export function getTokens(): PersistedTokens | null {
  return currentTokens;
}

const APP_USER_AGENT = `SpectrumMobile/1.0 (${Platform.OS} ${Platform.Version})`;

export const api: AxiosInstance = axios.create({
  baseURL: API_V1_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Platform': Platform.OS,
    'X-App-User-Agent': APP_USER_AGENT,
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  // X-Request-Id por requisição — rastreabilidade no audit_log do backend
  if (!config.headers['X-Request-Id']) {
    config.headers['X-Request-Id'] = generateRequestId();
  }

  if (currentTokens?.accessToken && !skipAuthHeader(config)) {
    config.headers.Authorization = `Bearer ${currentTokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    logNetworkErrorSafely(error);

    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    if (!currentTokens?.refreshToken) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newAccessToken = await runRefresh(currentTokens.refreshToken);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(original);
    } catch (refreshErr) {
      handleAuthFailure();
      return Promise.reject(refreshErr);
    }
  },
);

function runRefresh(refreshToken: string): Promise<string> {
  if (refreshInflight) return refreshInflight;

  refreshInflight = axios
    .post<RefreshResponse>(
      `${API_V1_URL}/auth/refresh`,
      { refreshToken },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': generateRequestId(),
          'X-App-Platform': Platform.OS,
        },
      },
    )
    .then(({ data }) => {
      const next: PersistedTokens = {
        accessToken: data.accessToken,
        refreshToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
      };
      currentTokens = next;
      void tokenStorage.save(next);
      onTokensUpdated?.(next);
      return data.accessToken;
    })
    .finally(() => {
      refreshInflight = null;
    });

  return refreshInflight;
}

function handleAuthFailure(): void {
  currentTokens = null;
  void tokenStorage.clear();
  onTokensUpdated?.(null);
  onUnauthorized?.();
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
}

function skipAuthHeader(config: AxiosRequestConfig): boolean {
  return isAuthEndpoint(config.url);
}

/**
 * Loga erros de rede sem expor headers/payloads sensíveis. Em build de
 * produção o babel-plugin-transform-remove-console remove `console.warn`,
 * então isso só vaza em dev — mas mesmo em dev mascaramos Authorization e
 * o corpo de qualquer endpoint /auth/*.
 */
function logNetworkErrorSafely(error: AxiosError): void {
  if (!IS_DEV_BUILD) return;
  try {
    const cfg = error.config;
    const url = cfg?.url ?? '?';
    const method = (cfg?.method ?? 'GET').toUpperCase();
    const status = error.response?.status ?? 'no-response';
    // Não logamos body de /auth/* pra não vazar senhas em logs do Metro.
    console.warn(`[api] ${method} ${url} -> ${status}`);
  } catch {
    /* noop */
  }
}

function generateRequestId(): string {
  // UUIDv4-like, sem dependência externa. Bom o bastante para correlação.
  const rand = (n: number) => Math.floor(Math.random() * n);
  const hex = (n: number, w: number) => n.toString(16).padStart(w, '0');
  return (
    hex(rand(0xffffffff), 8) +
    '-' +
    hex(rand(0xffff), 4) +
    '-' +
    hex(0x4000 | rand(0x0fff), 4) +
    '-' +
    hex(0x8000 | rand(0x3fff), 4) +
    '-' +
    hex(rand(0xffffffff), 8) +
    hex(rand(0xffff), 4)
  );
}
