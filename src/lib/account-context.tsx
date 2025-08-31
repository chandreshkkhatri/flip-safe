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
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, allowOfflineAccess } = useAuth();

  const fetchAccounts = useCallback(async () => {
    const userId = 'default_user';
    try {
      setLoadingAccounts(true);
      setError(null);
      
      const response = await axios.get(`${API_ROUTES.accounts.getAccounts}?userId=${userId}`);
      if (response.data?.success) {
        const binanceAccounts = response.data.accounts.filter(
          (acc: any) => acc.accountType === 'binance'
        ) as BinanceAccount[];
        
        setAccounts(binanceAccounts);
        
        // Check if there's a saved account ID in sessionStorage
        const savedAccountId = sessionStorage.getItem('selectedAccountId');
        
        if (savedAccountId && binanceAccounts.length > 0) {
          // Try to find the saved account
          const savedAccount = binanceAccounts.find(acc => acc._id === savedAccountId);
          if (savedAccount) {
            setSelectedAccountState(savedAccount);
          } else {
            // If saved account not found, select the first active or first account
            const defaultAccount = binanceAccounts.find(acc => acc.isActive) || binanceAccounts[0];
            setSelectedAccountState(defaultAccount);
            sessionStorage.setItem('selectedAccountId', defaultAccount._id);
          }
        } else if (binanceAccounts.length > 0) {
          // No saved account, select the first active or first account
          const defaultAccount = binanceAccounts.find(acc => acc.isActive) || binanceAccounts[0];
          setSelectedAccountState(defaultAccount);
          sessionStorage.setItem('selectedAccountId', defaultAccount._id);
        }
      }
    } catch (error) {
      console.error('Error fetching Binance accounts:', error);
      setError('Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  // Custom setter that also updates sessionStorage
  const setSelectedAccount = useCallback((account: BinanceAccount | null) => {
    setSelectedAccountState(account);
    if (account) {
      sessionStorage.setItem('selectedAccountId', account._id);
    } else {
      sessionStorage.removeItem('selectedAccountId');
    }
  }, []);

  // Fetch accounts on mount and when auth status changes
  useEffect(() => {
    if (isLoggedIn || allowOfflineAccess) {
      fetchAccounts();
    }
  }, [isLoggedIn, allowOfflineAccess, fetchAccounts]);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedAccountId = sessionStorage.getItem('selectedAccountId');
    if (savedAccountId && accounts.length > 0) {
      const savedAccount = accounts.find(acc => acc._id === savedAccountId);
      if (savedAccount && !selectedAccount) {
        setSelectedAccountState(savedAccount);
      }
    }
  }, [accounts]);

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