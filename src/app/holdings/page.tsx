'use client';

import EnhancedCard from '@/components/enhanced-card';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedHolding } from '@/lib/trading-service';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Using UnifiedHolding interface from trading-service

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<UnifiedHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchHoldings();
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchHoldings = async () => {
    // Mock user ID - in real app, get from auth context
    const userId = 'default_user';

    try {
      const response = await axios.get(`${API_ROUTES.trading.getHoldings}?userId=${userId}`);
      if (response.data?.success) {
        setHoldings(response.data.holdings || []);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch holdings');
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setError('Failed to fetch holdings');
      // Fallback to mock data for demo
      setHoldings([
        {
          id: 'mock_holding_1',
          accountId: 'demo_account',
          accountType: 'kite',
          symbol: 'RELIANCE',
          exchange: 'NSE',
          quantity: 50,
          averagePrice: 2200,
          lastPrice: 2500,
          currentValue: 125000,
          pnl: 15000,
          pnlPercentage: 13.64,
          isin: 'INE002A01018',
        } as UnifiedHolding,
        {
          id: 'mock_holding_2',
          accountId: 'demo_account',
          accountType: 'upstox',
          symbol: 'TCS',
          exchange: 'NSE',
          quantity: 25,
          averagePrice: 3100,
          lastPrice: 3200,
          currentValue: 80000,
          pnl: 2500,
          pnlPercentage: 3.23,
          isin: 'INE467B01029',
        } as UnifiedHolding,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalInvestment = holdings.reduce(
    (sum, holding) => sum + holding.averagePrice * holding.quantity,
    0
  );
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  if (loading) {
    return <LoadingSpinner message="Loading holdings..." />;
  }

  const columns = [
    {
      key: 'symbol',
      header: 'Symbol',
      render: (value: string, row: UnifiedHolding) => (
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
      key: 'currentValue',
      header: 'Current Value',
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
  ];

  return (
    <>
      <PageLayout title="Holdings">
        <div className="page-header">
          <h1>Portfolio Holdings</h1>
          <p>Manage your investment portfolio</p>
        </div>

        {/* Portfolio Summary */}
        <div className="portfolio-summary">
          <EnhancedCard className="summary-card">
            <div className="summary-item">
              <div className="summary-label">Current Value</div>
              <div className="summary-value">₹{totalValue.toFixed(2)}</div>
            </div>
          </EnhancedCard>

          <EnhancedCard className="summary-card">
            <div className="summary-item">
              <div className="summary-label">Total Investment</div>
              <div className="summary-value">₹{totalInvestment.toFixed(2)}</div>
            </div>
          </EnhancedCard>

          <EnhancedCard
            className="summary-card"
            customBackground={
              totalPnL >= 0
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
            }
            customTextColor="white"
          >
            <div className="summary-item">
              <div className="summary-label">Total P&L</div>
              <div className="summary-value">₹{totalPnL.toFixed(2)}</div>
            </div>
          </EnhancedCard>

          <EnhancedCard
            className="summary-card"
            customBackground={
              totalPnLPercentage >= 0
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
            }
            customTextColor="white"
          >
            <div className="summary-item">
              <div className="summary-label">Total P&L %</div>
              <div className="summary-value">{totalPnLPercentage.toFixed(2)}%</div>
            </div>
          </EnhancedCard>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        <Table
          columns={columns}
          data={holdings}
          emptyMessage="You don't have any holdings in your portfolio."
        />
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

        .page-header p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .binance-summary {
          margin-bottom: 32px;
          padding: 24px;
          background: var(--card);
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        
        .binance-summary h2 {
          margin: 0 0 16px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .binance-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .assets-breakdown h3 {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        
        .asset-item {
          padding: 12px;
          background: var(--muted);
          border-radius: 8px;
          text-align: center;
        }
        
        .asset-symbol {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--foreground);
          margin-bottom: 4px;
        }
        
        .asset-balance {
          font-size: 0.8rem;
          color: var(--muted-foreground);
          margin-bottom: 2px;
        }
        
        .asset-usd {
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--foreground);
        }
        
        .funds-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted-foreground);
          font-size: 0.9rem;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--muted);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .portfolio-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-card {
          text-align: center;
        }

        .summary-item {
          color: white;
          padding: 6px;
        }

        .summary-label {
          font-size: 0.75rem;
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 1.2rem;
          font-weight: 600;
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

        @media only screen and (max-width: 768px) {
          .portfolio-summary {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .summary-value {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
