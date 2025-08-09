'use client';

import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_ROUTES } from './constants';

interface AuthContextType {
  isLoggedIn: boolean;
  allowOfflineAccess: boolean;
  loginUrl: string | null;
  serviceUnavailable: boolean;
  checkedLoginStatus: boolean;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  runOfflineMode: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allowOfflineAccess, setAllowOfflineAccess] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [checkedLoginStatus, setCheckedLoginStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize state from sessionStorage
    const storedLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const storedOfflineAccess = sessionStorage.getItem('allowOfflineAccess') === 'true';

    setIsLoggedIn(storedLoggedIn);
    setAllowOfflineAccess(storedOfflineAccess);

    checkAuthStatus();

    // Set up periodic auth check
    const authInterval = setInterval(checkAuthStatus, 20000);

    return () => {
      clearInterval(authInterval);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ROUTES.auth.checkStatus);
      const { isLoggedIn: loggedIn, login_url } = response.data;

      setIsLoggedIn(loggedIn);
      setLoginUrl(login_url || null);
      setServiceUnavailable(false);

      if (loggedIn !== isLoggedIn || !checkedLoginStatus) {
        sessionStorage.setItem('isLoggedIn', String(loggedIn));
        setCheckedLoginStatus(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setServiceUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get(API_ROUTES.auth.logout);
      setIsLoggedIn(false);
      setAllowOfflineAccess(false);
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('allowOfflineAccess');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const runOfflineMode = () => {
    sessionStorage.setItem('allowOfflineAccess', 'true');
    setAllowOfflineAccess(true);
  };

  const login = () => {
    if (loginUrl) {
      window.location.href = loginUrl;
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    allowOfflineAccess,
    loginUrl,
    serviceUnavailable,
    checkedLoginStatus,
    loading,
    login,
    logout,
    runOfflineMode,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
