'use client';

import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Table from '@/components/ui/Table';
import { useAuth } from '@/lib/auth-context';
import { useAccount } from '@/lib/account-context';
import { API_ROUTES } from '@/lib/constants';
import { UnifiedOrder } from '@/lib/trading-service';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Receipt, Users, ShoppingCart } from 'lucide-react';

// Using UnifiedOrder interface from trading-service

export default function OrdersPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();
  const { selectedAccount, accounts: binanceAccounts } = useAccount();

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

        {!selectedAccount ? (
          /* No Account Selected State */
          <div className="empty-state-container">
            <div className="empty-state">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h2>Select Your Account</h2>
              <p className="empty-description">
                Choose a trading account from the header dropdown to view your order history and manage active orders.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                {binanceAccounts.length > 0 
                  ? `Found ${binanceAccounts.length} connected account${binanceAccounts.length > 1 ? 's' : ''}`
                  : 'No accounts found. Add an account to get started.'
                }
              </div>
            </div>
          </div>
        ) : orders.length === 0 && !loading && !error ? (
          /* No Orders State */
          <div className="empty-state-container">
            <div className="empty-state">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-blue-600" />
              </div>
              <h2>No Orders Yet</h2>
              <p className="empty-description">
                You haven't placed any orders yet. Start trading to see your order history here.
              </p>
              
              <div className="empty-state-features">
                <div className="feature-item">
                  <Receipt className="feature-icon" size={20} />
                  <span>Track order status</span>
                </div>
                <div className="feature-item">
                  <ShoppingCart className="feature-icon" size={20} />
                  <span>Manage active orders</span>
                </div>
              </div>

              <Button 
                className="mt-6"
                onClick={() => window.location.href = '/market-watch'}
              >
                Place Your First Order
              </Button>
              
              <div className="text-xs text-gray-500 mt-4">
                Your order history will appear here once you start trading
              </div>
            </div>
          </div>
        ) : (
          /* Orders Exist - Show Table */
          <>
            {error && (
              <div className="error-message">
                <p>⚠️ {error}</p>
              </div>
            )}

            <Table columns={columns} data={orders} emptyMessage="You haven't placed any orders yet." />
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
          color: #3b82f6;
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
