'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';

interface Order {
  order_id: string;
  tradingsymbol: string;
  quantity: number;
  transaction_type: string;
  order_type: string;
  status: string;
  price?: number;
  average_price?: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchOrders();
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchOrders = async () => {
    if (!isLoggedIn) {
      // Mock data for offline mode
      setOrders([
        {
          order_id: 'ORDER001',
          tradingsymbol: 'RELIANCE',
          quantity: 100,
          transaction_type: 'BUY',
          order_type: 'LIMIT',
          status: 'OPEN',
          price: 2500,
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_ROUTES.kc.getOrders);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await axios.post(API_ROUTES.orders.cancelOrder, { order_id: orderId });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '80px' }}>
      {/* Navigation Bar */}
      <nav className="navbar-fixed">
        <nav className="blue">
          <div className="nav-wrapper container">
            <a href="/dashboard" className="brand-logo">
              Flip Safe
            </a>
            <ul className="right">
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/positions">Positions</a>
              </li>
              <li>
                <a href="/holdings">Holdings</a>
              </li>
            </ul>
          </div>
        </nav>
      </nav>

      <div className="row">
        <div className="col s12">
          <h4>Orders</h4>

          {error && (
            <div className="card-panel red lighten-4 red-text text-darken-2">
              <p>{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="card">
              <div className="card-content center-align">
                <h5>No Orders Found</h5>
                <p>You haven't placed any orders yet.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-content">
                <table className="striped responsive-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.order_id}>
                        <td>{order.order_id}</td>
                        <td>{order.tradingsymbol}</td>
                        <td>
                          <span
                            className={order.transaction_type === 'BUY' ? 'green-text' : 'red-text'}
                          >
                            {order.transaction_type}
                          </span>
                        </td>
                        <td>{order.quantity}</td>
                        <td>
                          {order.average_price
                            ? `₹${order.average_price}`
                            : order.price
                              ? `₹${order.price}`
                              : 'Market'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === 'COMPLETE'
                                ? 'green'
                                : order.status === 'OPEN'
                                  ? 'blue'
                                  : order.status === 'CANCELLED'
                                    ? 'red'
                                    : 'grey'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.status === 'OPEN' && (
                            <button
                              className="btn red btn-small"
                              onClick={() => cancelOrder(order.order_id)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
