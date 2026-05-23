const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://spectrum-ai-api.onrender.com';

const NORMALIZED = RAW_API_URL.replace(/\/+$/, '');

export const API_BASE_URL = NORMALIZED;
export const API_V1_URL = `${NORMALIZED}/v1`;
export const REQUEST_TIMEOUT_MS = 30000;
