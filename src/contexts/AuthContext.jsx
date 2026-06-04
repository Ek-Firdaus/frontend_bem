import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedUser         = localStorage.getItem('user');
      const storedAccessToken  = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedAccessToken) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      }
    } catch {
      // corrupted storage — clear it
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (npm, password) => {
    const response = await api.post('/login', { npm, password });
    const { accessToken: at, refreshToken: rt, user: u } = response.data.data;

    localStorage.setItem('accessToken',  at);
    localStorage.setItem('refreshToken', rt);
    localStorage.setItem('user',         JSON.stringify(u));

    setAccessToken(at);
    setRefreshToken(rt);
    setUser(u);

    return u; // return user so caller can redirect based on role
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        await api.delete('/logout', { data: { refreshToken: rt } });
      }
    } catch {
      // ignore logout errors — clear locally regardless
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = () => !!accessToken && !!user;

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
