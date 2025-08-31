'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ROUTES } from './constants';
import { useAuth } from './auth-context';

interface BinanceAccount {
  _id: string;
  accountName: string;
  accountType: 'binance';
  isActive: boolean;
}

interface AccountContextType {
  selectedAccount: BinanceAccount | null;
  setSelectedAccount: (account: BinanceAccount | null) => void;
  accounts: BinanceAccount[];
  loadingAccounts: boolean;
  fetchAccounts: () => Promise<void>;
  error: string | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [selectedAccount, setSelectedAccountState] = useState<BinanceAccount | null>(null);
  const [accounts, setAccounts] = useState<BinanceAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false); // Start as false for immediate rendering
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, allowOfflineAccess } = useAuth();

  const fetchAccounts = useCallback(async (isBackground = false) => {
    const userId = 'default_user';
    
    // Check cache first
    const cacheKey = 'accountsCache';
    const cacheTimeKey = 'accountsCacheTime';
    const cacheTime = 120000; // 2 minutes cache
    
    const cachedData = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(cacheTimeKey);
    
    if (cachedData && cacheTimestamp && !isBackground) {
      const now = Date.now();
      if (now - parseInt(cacheTimestamp) < cacheTime) {
        // Use cached data for immediate rendering
        const cachedAccounts = JSON.parse(cachedData) as BinanceAccount[];
        setAccounts(cachedAccounts);
        
        // Restore selected account from cache
        const savedAccountId = sessionStorage.getItem('selectedAccountId');
        if (savedAccountId && cachedAccounts.length > 0) {
          const savedAccount = cachedAccounts.find(acc => acc._id === savedAccountId);
          if (savedAccount) {
            setSelectedAccountState(savedAccount);
          }
        }
        
        // Fetch fresh data in background
        setTimeout(() => fetchAccounts(true), 100);
        return;
      }
    }
    
    try {
      if (!isBackground) {
        setLoadingAccounts(true);
      }
      setError(null);
      
      const response = await axios.get(`${API_ROUTES.accounts.getAccounts}?userId=${userId}`, {
        timeout: 5000, // Add timeout
      });
      
      if (response.data?.success) {
        const binanceAccounts = response.data.accounts.filter(
          (acc: any) => acc.accountType === 'binance'
        ) as BinanceAccount[];
        
        // Update cache
        sessionStorage.setItem(cacheKey, JSON.stringify(binanceAccounts));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
        
        setAccounts(binanceAccounts);
        
        // Only update selected account if not already set
        if (!selectedAccount) {
          const savedAccountId = sessionStorage.getItem('selectedAccountId');
          
          if (savedAccountId && binanceAccounts.length > 0) {
            const savedAccount = binanceAccounts.find(acc => acc._id === savedAccountId);
            if (savedAccount) {
              setSelectedAccountState(savedAccount);
            } else {
              const defaultAccount = binanceAccounts.find(acc => acc.isActive) || binanceAccounts[0];
              setSelectedAccountState(defaultAccount);
              sessionStorage.setItem('selectedAccountId', defaultAccount._id);
            }
          } else if (binanceAccounts.length > 0) {
            const defaultAccount = binanceAccounts.find(acc => acc.isActive) || binanceAccounts[0];
            setSelectedAccountState(defaultAccount);
            sessionStorage.setItem('selectedAccountId', defaultAccount._id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Binance accounts:', error);
      if (!isBackground) {
        setError('Failed to fetch accounts');
        setAccounts([]);
      }
    } finally {
      if (!isBackground) {
        setLoadingAccounts(false);
      }
    }
  }, [selectedAccount]);

  // Custom setter that also updates sessionStorage
  const setSelectedAccount = useCallback((account: BinanceAccount | null) => {
    setSelectedAccountState(account);
    if (account) {
      sessionStorage.setItem('selectedAccountId', account._id);
    } else {
      sessionStorage.removeItem('selectedAccountId');
    }
  }, []);

  // Initialize from cache immediately, then fetch fresh data in background
  useEffect(() => {
    // Load from cache first for immediate rendering
    const cacheKey = 'accountsCache';
    const cachedData = sessionStorage.getItem(cacheKey);
    const savedAccountId = sessionStorage.getItem('selectedAccountId');
    
    if (cachedData) {
      try {
        const cachedAccounts = JSON.parse(cachedData) as BinanceAccount[];
        setAccounts(cachedAccounts);
        
        if (savedAccountId && cachedAccounts.length > 0) {
          const savedAccount = cachedAccounts.find(acc => acc._id === savedAccountId);
          if (savedAccount) {
            setSelectedAccountState(savedAccount);
          }
        }
      } catch (error) {
        console.error('Error parsing cached accounts:', error);
      }
    }
    
    // Fetch fresh data only if logged in or offline access allowed
    if (isLoggedIn || allowOfflineAccess) {
      // Small delay to allow for immediate rendering
      setTimeout(() => fetchAccounts(), 50);
    }
  }, []); // Only run on mount

  // Only refetch when auth status actually changes (not on every auth check)
  useEffect(() => {
    if (isLoggedIn || allowOfflineAccess) {
      // Use background fetch to avoid blocking UI
      fetchAccounts(true);
    }
  }, [isLoggedIn, allowOfflineAccess]);

  const value: AccountContextType = {
    selectedAccount,
    setSelectedAccount,
    accounts,
    loadingAccounts,
    fetchAccounts,
    error,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export type { BinanceAccount };