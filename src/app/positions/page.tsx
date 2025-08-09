'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import axios from 'axios';

interface Position {
  tradingsymbol: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
  product: string;
  exchange: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isLoggedIn, allowOfflineAccess } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      router.push('/login');
      return;
    }

    fetchPositions();
  }, [isLoggedIn, allowOfflineAccess, router]);

  const fetchPositions = async () => {
    if (!isLoggedIn) {
      // Mock data for offline mode
      setPositions([
        {
          tradingsymbol: 'RELIANCE',
          quantity: 100,
          average_price: 2450,
          last_price: 2500,
          pnl: 5000,
          pnl_percentage: 2.04,
          product: 'CNC',
          exchange: 'NSE'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_ROUTES.kc.getPositions);
      setPositions(response.data?.net || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setError('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading positions...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '80px' }}>
      {/* Navigation Bar */}
      <nav className="navbar-fixed">
        <nav className="blue">
          <div className="nav-wrapper container">
            <a href="/dashboard" className="brand-logo">Flip Safe</a>
            <ul className="right">
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/orders">Orders</a></li>
              <li><a href="/holdings">Holdings</a></li>
            </ul>
          </div>
        </nav>
      </nav>

      <div className="row">
        <div className="col s12">
          <h4>Positions</h4>
          
          {error && (
            <div className="card-panel red lighten-4 red-text text-darken-2">
              <p>{error}</p>
            </div>
          )}

          {positions.length === 0 ? (
            <div className="card">
              <div className="card-content center-align">
                <h5>No Open Positions</h5>
                <p>You don't have any open positions today.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-content">
                <table className="striped responsive-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Quantity</th>
                      <th>Avg Price</th>
                      <th>Last Price</th>
                      <th>P&L</th>
                      <th>P&L %</th>
                      <th>Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position, index) => (
                      <tr key={`${position.tradingsymbol}-${index}`}>
                        <td>
                          <strong>{position.tradingsymbol}</strong>
                          <br />
                          <small className="grey-text">{position.exchange}</small>
                        </td>
                        <td>{position.quantity}</td>
                        <td>₹{position.average_price?.toFixed(2)}</td>
                        <td>₹{position.last_price?.toFixed(2)}</td>
                        <td className={position.pnl >= 0 ? 'green-text' : 'red-text'}>
                          <strong>₹{position.pnl?.toFixed(2)}</strong>
                        </td>
                        <td className={position.pnl_percentage >= 0 ? 'green-text' : 'red-text'}>
                          <strong>{position.pnl_percentage?.toFixed(2)}%</strong>
                        </td>
                        <td>
                          <span className="badge blue white-text">{position.product}</span>
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