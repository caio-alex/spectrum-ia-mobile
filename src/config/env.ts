const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

const NORMALIZED = RAW_API_URL.replace(/\/+$/, '');

export const API_BASE_URL = NORMALIZED;
export const API_V1_URL = `${NORMALIZED}/v1`;
export const REQUEST_TIMEOUT_MS = 30000;
