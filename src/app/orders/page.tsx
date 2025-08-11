'use client';

import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedOrder } from '@/lib/trading-service';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Using UnifiedOrder interface from trading-service

export default function OrdersPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchOrders();
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchOrders = async () => {
    // Mock user ID - in real app, get from auth context
    const userId = 'default_user';

    try {
      const response = await axios.get(`${API_ROUTES.trading.getOrders}?userId=${userId}`);
      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Failed to fetch orders');
      // Fallback to mock data for demo
      setOrders([
        {
          id: 'mock_order_1',
          accountId: 'demo_account',
          accountType: 'kite',
          symbol: 'RELIANCE',
          exchange: 'NSE',
          quantity: 100,
          price: 2500,
          orderType: 'LIMIT',
          transactionType: 'BUY',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
        } as UnifiedOrder,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      // TODO: Implement cancel order for multi-account
      // TODO: Implement cancel order functionality
      // await axios.post(API_ROUTES.orders.cancelOrder, { order_id: orderId });
      // fetchOrders(); // Refresh the orders list
    } catch (error) {
      // Swallow cancel error; add toast later
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      render: (value: string) => value.substring(value.length - 8), // Show last 8 chars
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (value: string, row: UnifiedOrder) => (
        <div className="symbol-info">
          <div className="symbol-name">{value}</div>
          <div className="account-badge">{row.accountType.toUpperCase()}</div>
        </div>
      ),
    },
    {
      key: 'transactionType',
      header: 'Type',
      render: (value: string) => (
        <span className={value === 'BUY' ? 'transaction-buy' : 'transaction-sell'}>{value}</span>
      ),
    },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'price',
      header: 'Price',
      render: (value: number, row: UnifiedOrder) => {
        if (row.averagePrice) return `₹${row.averagePrice}`;
        if (value) return `₹${value}`;
        return 'Market';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value.toLowerCase() === 'complete'
              ? 'success'
              : value.toLowerCase() === 'open'
                ? 'info'
                : value.toLowerCase() === 'cancelled'
                  ? 'danger'
                  : 'neutral'
          }
          tone="soft"
          className="uppercase"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: UnifiedOrder) =>
        row.status === 'OPEN' ? (
          <Button variant="danger" size="sm" onClick={() => cancelOrder(row.id)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageLayout title="Orders">
        <div className="page-header">
          <h1>Orders</h1>
          <p>View and manage your trading orders</p>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        <Table columns={columns} data={orders} emptyMessage="You haven't placed any orders yet." />
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

        .transaction-buy {
          color: #4caf50;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .transaction-sell {
          color: #f44336;
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* Status badge styles migrated to shared Badge component */

        /* .btn-cancel styles removed (replaced with Button) */

        .symbol-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .symbol-name {
          font-weight: 600;
          font-size: 0.85rem;
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
        }
      `}</style>
    </>
  );
}
