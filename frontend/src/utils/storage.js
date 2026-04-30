const logStorageIssue = (type, key, details = {}) => {
  const payload = { type, key, ...details };
  console.error('[MarketLoop storage]', payload);
  if (typeof window !== 'undefined') {
    window.__MARKETLOOP_LAST_STORAGE_ERROR__ = payload;
  }
};

const getStorage = (storageType = 'local') => {
  if (typeof window === 'undefined') return null;
  return storageType === 'session' ? window.sessionStorage : window.localStorage;
};

export const safeParse = (value, fallback = null, { key = 'unknown', onError } = {}) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    logStorageIssue('parse_failed', key, { message: error.message });
    onError?.(error);
    return fallback;
  }
};

export const readStoredJson = (key, fallback, options = {}) => {
  const { validate, storageType = 'local' } = options;
  const storage = getStorage(storageType);
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;

    const parsed = safeParse(raw, fallback, {
      key,
      onError: () => storage.removeItem(key)
    });

    if (parsed === fallback) return fallback;

    if (validate && !validate(parsed)) {
      logStorageIssue('validation_failed', key);
      storage.removeItem(key);
      return fallback;
    }

    return parsed;
  } catch (error) {
    logStorageIssue('read_failed', key, { message: error.message });
    try {
      storage.removeItem(key);
    } catch {
      // ignore cleanup failure
    }
    return fallback;
  }
};

export const readStoredValue = (key, fallback = '', options = {}) => {
  const storage = getStorage(options.storageType || 'local');
  if (!storage) return fallback;

  try {
    return storage.getItem(key) ?? fallback;
  } catch (error) {
    logStorageIssue('value_read_failed', key, { message: error.message });
    return fallback;
  }
};

export const writeStoredJson = (key, value, options = {}) => {
  const storage = getStorage(options.storageType || 'local');
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logStorageIssue('write_failed', key, { message: error.message });
  }
};

export const writeStoredValue = (key, value, options = {}) => {
  const storage = getStorage(options.storageType || 'local');
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch (error) {
    logStorageIssue('value_write_failed', key, { message: error.message });
  }
};

export const clearBrowserData = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.clear();
  } catch (error) {
    logStorageIssue('local_clear_failed', 'all', { message: error.message });
  }
  try {
    window.sessionStorage.clear();
  } catch (error) {
    logStorageIssue('session_clear_failed', 'all', { message: error.message });
  }
};

const isValidUser = (value) => value && typeof value === 'object' && (!value.roles || Array.isArray(value.roles));
const isValidStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');
const isValidCart = (value) =>
  Array.isArray(value)
  && value.every((item) => item && typeof item === 'object' && typeof item.productId === 'string' && Number.isFinite(Number(item.quantity)));
const isValidTheme = (value) => ['light', 'dark', 'system', null].includes(value);

export const sanitizePersistedState = () => {
  readStoredJson('marketloop_web_cart', [], { validate: isValidCart });
  readStoredJson('marketloop_recent_searches', [], { validate: isValidStringArray });
  readStoredJson('user', null, { validate: isValidUser });

  const theme = readStoredValue('marketloop-theme', 'system');
  if (!isValidTheme(theme)) {
    logStorageIssue('validation_failed', 'marketloop-theme');
    try {
      window.localStorage.removeItem('marketloop-theme');
    } catch {
      // ignore cleanup failure
    }
  }
};
