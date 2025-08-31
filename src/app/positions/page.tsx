'use client';

import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useAccount } from '@/lib/account-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedPosition } from '@/lib/trading-service';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';

// Using UnifiedPosition interface from trading-service

export default function PositionsPage() {
  const [positions, setPositions] = useState<UnifiedPosition[]>([]);
  const [loading, setLoading] = useState(false); // Start as false for immediate rendering
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();
  const { selectedAccount, accounts: binanceAccounts } = useAccount();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    // Small delay to allow for immediate page rendering
    setTimeout(() => fetchPositions(), 50);
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchPositions = async () => {
    // Mock user ID - in real app, get from auth context
    const userId = 'default_user';

    try {
      const response = await axios.get(`${API_ROUTES.trading.getPositions}?userId=${userId}`);
      if (response.data?.success) {
        setPositions(response.data.positions || []);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch positions');
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setError('Failed to fetch positions');
      // Fallback to mock data for demo
      setPositions([
        {
          id: 'mock_position_1',
          accountId: 'demo_account',
          accountType: 'kite',
          symbol: 'RELIANCE',
          exchange: 'NSE',
          quantity: 100,
          averagePrice: 2450,
          lastPrice: 2500,
          pnl: 5000,
          pnlPercentage: 2.04,
          product: 'CNC',
        } as UnifiedPosition,
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading positions..." />;
  }

  const columns = [
    {
      key: 'symbol',
      header: 'Symbol',
      render: (value: string, row: UnifiedPosition) => (
        <div className="symbol-info">
          <div className="symbol-name">{value}</div>
          <div className="account-badge">{row.accountType.toUpperCase()}</div>
          <div className="exchange">{row.exchange}</div>
        </div>
      ),
    },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'averagePrice',
      header: 'Avg Price',
      render: (value: number) => `₹${value?.toFixed(2)}`,
    },
    {
      key: 'lastPrice',
      header: 'Last Price',
      render: (value: number) => `₹${value?.toFixed(2)}`,
    },
    {
      key: 'pnl',
      header: 'P&L',
      render: (value: number) => (
        <span className={`pnl-value ${value >= 0 ? 'positive' : 'negative'}`}>
          ₹{value?.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'pnlPercentage',
      header: 'P&L %',
      render: (value: number) => (
        <span className={`pnl-value ${value >= 0 ? 'positive' : 'negative'}`}>
          {value?.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (value: string) => <span className="product-badge">{value}</span>,
    },
  ];

  return (
    <>
      <PageLayout title="Positions">
        <div className="page-header">
          <h1>Positions</h1>
          <p>Track your current trading positions</p>
        </div>

        {!selectedAccount ? (
          /* No Account Selected State */
          <div className="empty-state-container">
            <div className="empty-state">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h2>Select Your Account</h2>
              <p className="empty-description">
                Choose a trading account from the header dropdown to view your current positions and track your trades.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                {binanceAccounts.length > 0 
                  ? `Found ${binanceAccounts.length} connected account${binanceAccounts.length > 1 ? 's' : ''}`
                  : 'No accounts found. Add an account to get started.'
                }
              </div>
            </div>
          </div>
        ) : positions.length === 0 && !loading && !error ? (
          /* No Positions State */
          <div className="empty-state-container">
            <div className="empty-state">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-orange-600" />
              </div>
              <h2>No Open Positions</h2>
              <p className="empty-description">
                You don't have any open positions right now. Start trading to see your positions here.
              </p>
              
              <div className="empty-state-features">
                <div className="feature-item">
                  <TrendingUp className="feature-icon" size={20} />
                  <span>Track live P&L</span>
                </div>
                <div className="feature-item">
                  <BarChart3 className="feature-icon" size={20} />
                  <span>Monitor position performance</span>
                </div>
              </div>

              <Button 
                className="mt-6"
                onClick={() => window.location.href = '/market-watch'}
              >
                Start Trading
              </Button>
              
              <div className="text-xs text-gray-500 mt-4">
                Your positions will appear here once you execute trades
              </div>
            </div>
          </div>
        ) : (
          /* Positions Exist - Show Table */
          <>
            {error && (
              <div className="error-message">
                <p>⚠️ {error}</p>
              </div>
            )}

            <Table
              columns={columns}
              data={positions}
              emptyMessage="You don't have any open positions today."
            />
          </>
        )}
      </PageLayout>

      <style jsx>{`
        .page-header {
          margin-bottom: 16px;
          text-align: center;
        }

        .page-header h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: #333;
        }

        :global(.dark) .page-header h1 {
          color: #ffffff !important;
        }

        .page-header p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        :global(.dark) .page-header p {
          color: #a1a1aa !important;
        }

        .empty-state-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 40px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e5e5;
          margin: 20px 0;
        }

        :global(.dark) .empty-state-container {
          background: #18181b !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 1px solid #3f3f46 !important;
        }

        .empty-state {
          text-align: center;
          max-width: 500px;
        }

        .empty-state h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 12px 0;
        }

        :global(.dark) .empty-state h2 {
          color: #ffffff !important;
        }

        .empty-description {
          font-size: 1rem;
          color: #666;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        :global(.dark) .empty-description {
          color: #a1a1aa !important;
        }

        .empty-state-features {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin: 20px 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.9rem;
        }

        :global(.dark) .feature-item {
          color: #a1a1aa !important;
        }

        .feature-icon {
          color: #f97316;
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

        .symbol-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .symbol-name {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .exchange {
          font-size: 0.7rem;
          color: #666;
        }

        .pnl-value {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .pnl-value.positive {
          color: #4caf50;
        }

        .pnl-value.negative {
          color: #f44336;
        }

        .product-badge {
          background: #2196f3;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .account-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 1px 4px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 600;
          text-align: center;
          width: fit-content;
          margin: 1px 0;
        }
      `}</style>
    </>
  );
}
