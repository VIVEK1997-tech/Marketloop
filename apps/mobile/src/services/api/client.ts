import axios from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The MarketLoop server took too long to respond. Check that the backend is running and reachable from your phone.';
    }
    if (!error.response) {
      return 'Unable to reach the MarketLoop server. Verify the mobile .env IP/port and make sure the backend is running on the same network.';
    }
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
