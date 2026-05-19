import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_V1_URL, REQUEST_TIMEOUT_MS } from '../config/env';
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

export const api: AxiosInstance = axios.create({
  baseURL: API_V1_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (currentTokens?.accessToken && !skipAuthHeader(config)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${currentTokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
      { timeout: REQUEST_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } },
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
