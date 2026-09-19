import axios from 'axios';

import { transformKeys } from '@/shared/api/interceptors.ts';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.response.use((response) => {
  response.data = transformKeys(response.data);

  return response;
});
