
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the authenticated session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = sessionStorage.getItem('svms_token');

        if (!token) {
          setUser(null);
          return;
        }

        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch {
        sessionStorage.removeItem('svms_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const handleUnauthorized = () => {
      sessionStorage.removeItem('svms_token');
      setUser(null);
    };

    window.addEventListener('svms:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('svms:unauthorized', handleUnauthorized);
    };
  }, []);

  // Login and save the JWT
  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const token = res.data.token;

    if (token) {
      sessionStorage.setItem('svms_token', token);
    }

    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Register and save the JWT
  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const token = res.data.token;

    if (token) {
      sessionStorage.setItem('svms_token', token);
    }

    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Logout and clear the JWT
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {}

    sessionStorage.removeItem('svms_token');
    setUser(null);
    toast.info('You have been logged out.');
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
};
