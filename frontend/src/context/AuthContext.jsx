import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

const normalizeUser = (user) => (user ? { ...user, id: user.id || user._id } : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      if (!token) return;
      try {
        const { data } = await api.get('/auth/me');
        const refreshedUser = normalizeUser(data.user);
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
      } catch {
        logout();
      }
    };
    refresh();
  }, [token]);

  const persistAuth = (data) => {
    const authUser = normalizeUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));
    setToken(data.token);
    setUser(authUser);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      persistAuth(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persistAuth(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout, setUser }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
