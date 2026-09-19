import axios from 'axios';

/**
 * Dedicated client for the XenoChoice Sandbox API. Unlike `shared/api/api.ts`,
 * this backend speaks camelCase on the wire in both directions (`worldId`,
 * `colonyId`, ...), so it must NOT go through the snake_case<->camelCase
 * interceptors the generic `API` client applies.
 */
const DEFAULT_BASE_URL = 'http://80.78.247.32:8080/api/v2';

export const XENOCHOICE_BASE_URL =
  import.meta.env.VITE_XENOCHOICE_API_URL || DEFAULT_BASE_URL;

/** The API budget is ~100 calls per 50 s, so a hung request must not hold a slot. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * WS endpoint for `/experiments/{id}/stream`. A relative base URL (dev proxy)
 * is resolved against the page origin, so `ws`/`wss` follows the page scheme.
 */
export const xenochoiceWsUrl = (path: string) => {
  const absolute = /^https?:\/\//.test(XENOCHOICE_BASE_URL)
    ? XENOCHOICE_BASE_URL
    : new URL(XENOCHOICE_BASE_URL, window.location.origin).toString();

  return `${absolute.replace(/^http/, 'ws').replace(/\/$/, '')}${path}`;
};

export const xenoApi = axios.create({
  baseURL: XENOCHOICE_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

type ApiErrorBody = { error?: { message?: string; code?: string } };

/**
 * Axios rejects any non-2xx before `unwrap` can read the body, so without this
 * the API's own `{success:false, error}` message never reaches the UI.
 */
xenoApi.interceptors.response.use(undefined, (error: unknown) => {
  if (!axios.isAxiosError(error)) return Promise.reject(error);

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return Promise.reject(new Error('Сервер не ответил вовремя'));
  }

  if (error.response?.status === 429) {
    return Promise.reject(
      new Error('Слишком много запросов к API — подождите несколько секунд'),
    );
  }

  const body = error.response?.data as ApiErrorBody | undefined;
  const message = body?.error?.message || body?.error?.code;

  return Promise.reject(message ? new Error(message) : error);
});
