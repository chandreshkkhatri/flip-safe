'use client';

import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedPosition } from '@/lib/trading-service';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Using UnifiedPosition interface from trading-service

export default function PositionsPage() {
  const [positions, setPositions] = useState<UnifiedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchPositions();
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
