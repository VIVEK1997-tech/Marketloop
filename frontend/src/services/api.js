import axios from 'axios';
import { resolveApiBaseUrl, resolveApiTimeout } from '../config/env.js';
import { readStoredValue } from '../utils/storage.js';

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: resolveApiTimeout()
});

api.interceptors.request.use((config) => {
  const token = readStoredValue('token', null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      return Promise.reject({
        response,
        message: response.data?.error || response.data?.message || 'Request failed'
      });
    }
    return response;
  },
  (error) => {
    if (
      error?.response?.status === 401
      && typeof window !== 'undefined'
      && !String(error?.config?.url || '').includes('/auth/login')
    ) {
      window.dispatchEvent(new CustomEvent('marketloop:auth-expired'));
    }
    return Promise.reject(error);
  }
);

export const extractApiData = (response) => response?.data?.data ?? response?.data ?? {};

export const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Backend server is not reachable. Verify VITE_API_URL, start the backend, and make sure the browser can reach the API.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  return responseData?.error || responseData?.message || error.message || 'Something went wrong';
};
