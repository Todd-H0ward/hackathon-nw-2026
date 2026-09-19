import axios from 'axios';

import { keysToCamelCase, keysToSnakeCase } from '@/shared/api/interceptors';
import type { TUser } from '@/shared/types';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (config.data && !(config.data instanceof FormData)) {
    config.data = keysToSnakeCase(config.data);
  }

  if (config.params) {
    config.params = keysToSnakeCase(config.params);
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    response.data = keysToCamelCase(response.data);
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      error.response.data = keysToCamelCase(error.response.data);
    }

    return Promise.reject(error);
  },
);

export const getCurrentUser = async (): Promise<TUser> => {
  const { data } = await API.get<TUser>('/me');
  return data;
};
