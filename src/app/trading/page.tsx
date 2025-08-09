'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Watchlist from '@/components/watchlist/Watchlist';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';

interface BinanceAccount {
  _id: string;
  accountName: string;
  accountType: 'binance';
  isActive: boolean;
}

export default function TradingPage() {
  const [binanceAccounts, setBinanceAccounts] = useState<BinanceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchBinanceAccounts();
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchBinanceAccounts = async () => {
    const userId = 'default_user';

    try {
      const response = await axios.get(`${API_ROUTES.accounts.getAccounts}?userId=${userId}`);
      
      if (response.data?.success) {
        // Filter only Binance accounts
        const binanceAccs = response.data.accounts.filter(
          (acc: any) => acc.accountType === 'binance' && acc.isActive
        );
        setBinanceAccounts(binanceAccs);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching Binance accounts:', error);
      setError('Failed to fetch Binance accounts');
      
      // For demo purposes, add a mock Binance account if none exist
      setBinanceAccounts([
        {
          _id: 'mock_binance_1',
          accountName: 'My Binance Futures',
          accountType: 'binance',
          isActive: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trading interface..." />;
  }

  return (
    <PageLayout title="Trading">
      <div className="trading-page">
        <div className="page-header">
          <h1>Futures Trading</h1>
          <p>Trade Binance USD-M perpetual futures</p>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <p><small>Using demo data for development</small></p>
          </div>
        )}

        <div className="trading-content">
          <Watchlist binanceAccounts={binanceAccounts} />
        </div>

        <div className="trading-info">
          <div className="info-card">
            <h4>Risk Warning</h4>
            <p>
              Futures trading involves substantial risk of loss and is not suitable for all investors. 
              Please ensure you understand the risks before trading.
            </p>
          </div>
          
          <div className="info-card">
            <h4>Features</h4>
            <ul>
              <li>Real-time market data</li>
              <li>Multiple order types (Market, Limit, Stop)</li>
              <li>Leverage up to 100x</li>
              <li>Advanced risk management</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .trading-page {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 80vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 8px;
        }

        .page-header h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: #333;
        }

        .page-header p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .error-message {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 12px;
          color: #856404;
          font-size: 0.85rem;
        }

        .error-message p {
          margin: 4px 0;
        }

        .trading-content {
          flex: 1;
          min-height: 600px;
        }

        .trading-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .info-card {
          background: white;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .info-card h4 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #333;
          font-weight: 600;
        }

        .info-card p {
          margin: 0;
          font-size: 0.8rem;
          color: #666;
          line-height: 1.4;
        }

        .info-card ul {
          margin: 0;
          padding-left: 16px;
          font-size: 0.8rem;
          color: #666;
        }

        .info-card li {
          margin-bottom: 4px;
        }

        @media only screen and (max-width: 768px) {
          .trading-info {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .info-card {
            padding: 12px;
          }
        }
      `}</style>
    </PageLayout>
  );
}