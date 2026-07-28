import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hackverse_token'));
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = async () => {
    const savedToken = localStorage.getItem('hackverse_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        setToken(savedToken);
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch {
      localStorage.removeItem('hackverse_token');
      localStorage.removeItem('hackverse_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('hackverse_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signup = async (name, email, password) => {
    const res = await authService.signup({ name, email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('hackverse_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Signup failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('hackverse_token');
      localStorage.removeItem('hackverse_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshSession: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
