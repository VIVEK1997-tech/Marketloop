const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getWindowOrigin = () => {
  if (typeof window === 'undefined') return '';
  return trimTrailingSlash(window.location.origin);
};

const isLocalBrowser = () => {
  if (typeof window === 'undefined') return true;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

export const resolveApiBaseUrl = () => {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_URL || '');
  if (configured) return configured;
  if (!isLocalBrowser()) return `${getWindowOrigin()}/api`;
  return 'http://localhost:5000/api';
};

export const resolveSocketUrl = () => {
  const configured = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || '');
  if (configured) return configured;
  if (!isLocalBrowser()) return getWindowOrigin();
  return 'http://localhost:5000';
};

export const resolveApiTimeout = () => {
  const raw = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);
  return Number.isFinite(raw) && raw > 0 ? raw : 15000;
};
