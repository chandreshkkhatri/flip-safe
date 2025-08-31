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
  const [allowOfflineAccess, setAllowOfflineAccess] = useState(true); // Default to offline access
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [checkedLoginStatus, setCheckedLoginStatus] = useState(false);
  const [loading, setLoading] = useState(false); // Start as false for immediate rendering

  useEffect(() => {
    // Initialize state from sessionStorage immediately (synchronous)
    const storedLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const storedOfflineAccess = sessionStorage.getItem('allowOfflineAccess');
    const lastAuthCheck = sessionStorage.getItem('lastAuthCheck');
    const authCacheTime = 60000; // Cache for 1 minute

    setIsLoggedIn(storedLoggedIn);
    setAllowOfflineAccess(storedOfflineAccess !== 'false');
    setCheckedLoginStatus(true); // Allow immediate rendering

    // Only check auth if cache is expired or doesn't exist
    const now = Date.now();
    const shouldCheckAuth = !lastAuthCheck || (now - parseInt(lastAuthCheck)) > authCacheTime;

    if (shouldCheckAuth) {
      // Run auth check in background without blocking render
      checkAuthStatus();
    }

    // Set up periodic auth check with longer interval
    const authInterval = setInterval(checkAuthStatus, 60000); // Reduced frequency

    return () => {
      clearInterval(authInterval);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Don't set loading to true for background checks to avoid blocking UI
      const response = await axios.get(API_ROUTES.auth.checkStatus, {
        timeout: 5000, // Add timeout to prevent hanging
      });
      const { isLoggedIn: loggedIn, login_url } = response.data;

      // Update cache timestamp
      sessionStorage.setItem('lastAuthCheck', Date.now().toString());
      
      // Only update state if there's an actual change
      if (loggedIn !== isLoggedIn) {
        setIsLoggedIn(loggedIn);
        sessionStorage.setItem('isLoggedIn', String(loggedIn));
      }
      
      if (login_url !== loginUrl) {
        setLoginUrl(login_url || null);
      }
      
      setServiceUnavailable(false);
      setCheckedLoginStatus(true);
      // Clear failure count on success
      sessionStorage.removeItem('authFailureCount');
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Don't immediately set service unavailable - only after multiple failures
      const failureCount = parseInt(sessionStorage.getItem('authFailureCount') || '0') + 1;
      sessionStorage.setItem('authFailureCount', failureCount.toString());
      
      if (failureCount >= 3) {
        setServiceUnavailable(true);
      }
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
    setCheckedLoginStatus(true);
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
