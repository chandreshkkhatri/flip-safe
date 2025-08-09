'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedOrder } from '@/lib/trading-service';

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
      console.error('Error fetching orders:', error);
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
      alert('Cancel order functionality will be implemented soon');
      // await axios.post(API_ROUTES.orders.cancelOrder, { order_id: orderId });
      // fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Failed to cancel order');
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
        <span className={value === 'BUY' ? 'transaction-buy' : 'transaction-sell'}>
          {value}
        </span>
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
        <span className={`status-badge status-${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: UnifiedOrder) => (
        row.status === 'OPEN' ? (
          <button
            className="btn-cancel"
            onClick={() => cancelOrder(row.id)}
          >
            Cancel
          </button>
        ) : null
      ),
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

        <Table
          columns={columns}
          data={orders}
          emptyMessage="You haven't placed any orders yet."
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
        
        .status-badge {
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .status-complete {
          background: #4caf50;
          color: white;
        }
        
        .status-open {
          background: #2196f3;
          color: white;
        }
        
        .status-cancelled {
          background: #f44336;
          color: white;
        }
        
        .status-rejected {
          background: #9e9e9e;
          color: white;
        }
        
        .btn-cancel {
          background: #f44336;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: background 0.2s ease;
        }
        
        .btn-cancel:hover {
          background: #d32f2f;
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
