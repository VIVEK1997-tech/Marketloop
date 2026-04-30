import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, extractApiData } from '../services/api.js';
import { cartApi } from '../services/cartApi.js';
import { disconnectSocket } from '../services/socket.js';
import { readStoredJson, readStoredValue, writeStoredValue } from '../utils/storage.js';

const AuthContext = createContext(null);
const PENDING_VERIFICATION_EMAIL_KEY = 'pendingVerificationEmail';

const normalizeUser = (user) => {
  if (!user) return null;
  const roles = Array.isArray(user.roles) && user.roles.length ? user.roles : user.role ? [user.role] : ['buyer'];
  const activeRole = user.activeRole || user.role || (roles.includes('buyer') ? 'buyer' : roles[0]);

  return {
    ...user,
    id: user.id || user._id,
    roles,
    role: activeRole,
    activeRole
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return normalizeUser(
      readStoredJson('user', null, {
        validate: (value) => value && typeof value === 'object'
      })
    );
  });
  const [token, setToken] = useState(() => readStoredValue('token', null));
  const [loading, setLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(() => readStoredValue(PENDING_VERIFICATION_EMAIL_KEY, ''));

  useEffect(() => {
    const refresh = async () => {
      if (!token) return;
      try {
        const response = await api.get('/me');
        const data = extractApiData(response);
        const refreshedUser = normalizeUser(data.user);
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
        await cartApi.bootstrapFromServer();
      } catch {
        logout();
      }
    };
    refresh();
  }, [token]);

  useEffect(() => {
    const handleAuthExpired = () => logout();
    window.addEventListener('marketloop:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('marketloop:auth-expired', handleAuthExpired);
  }, []);

  const persistUser = (nextUser) => {
    const normalizedUser = normalizeUser(nextUser);
    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }
    setUser(normalizedUser);
  };

  const persistAuth = (data) => {
    const authUser = normalizeUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));
    localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
    setToken(data.token);
    persistUser(authUser);
    setPendingVerificationEmail('');
    cartApi.bootstrapFromServer().catch(() => null);
  };

  const persistPendingVerificationEmail = (email) => {
    const normalizedEmail = email || '';
    if (normalizedEmail) {
      writeStoredValue(PENDING_VERIFICATION_EMAIL_KEY, normalizedEmail);
    } else {
      localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
    }
    setPendingVerificationEmail(normalizedEmail);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const data = extractApiData(response);
      persistAuth(data);
      return data;
    } catch (error) {
      if (error.response?.data?.message === 'Please verify your email first') {
        persistPendingVerificationEmail(credentials.email);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', payload);
      const data = extractApiData(response);
      persistPendingVerificationEmail(data.email || payload.email);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({ email, otp }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const data = extractApiData(response);
      persistPendingVerificationEmail('');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-otp', { email });
      const data = extractApiData(response);
      persistPendingVerificationEmail(data.email || email);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    persistUser(null);
    cartApi.clearLocalOnly();
    disconnectSocket();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      pendingVerificationEmail,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      setUser: persistUser,
      setPendingVerificationEmail: persistPendingVerificationEmail
    }),
    [user, token, loading, pendingVerificationEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
