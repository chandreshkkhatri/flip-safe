'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';

interface Holding {
  tradingsymbol: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
  exchange: string;
  isin: string;
}

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchHoldings();
  }, [isLoggedIn, allowOfflineAccess, runOfflineMode]);

  const fetchHoldings = async () => {
    if (!isLoggedIn) {
      // Mock data for offline mode
      setHoldings([
        {
          tradingsymbol: 'RELIANCE',
          quantity: 50,
          average_price: 2200,
          last_price: 2500,
          pnl: 15000,
          pnl_percentage: 13.64,
          exchange: 'NSE',
          isin: 'INE002A01018',
        },
        {
          tradingsymbol: 'TCS',
          quantity: 25,
          average_price: 3100,
          last_price: 3200,
          pnl: 2500,
          pnl_percentage: 3.23,
          exchange: 'NSE',
          isin: 'INE467B01029',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_ROUTES.kc.getHoldings);
      setHoldings(response.data || []);
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setError('Failed to fetch holdings');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = holdings.reduce(
    (sum, holding) => sum + holding.last_price * holding.quantity,
    0
  );
  const totalInvestment = holdings.reduce(
    (sum, holding) => sum + holding.average_price * holding.quantity,
    0
  );
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  if (loading) {
    return <div className="loading">Loading holdings...</div>;
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
                <a href="/orders">Orders</a>
              </li>
              <li>
                <a href="/positions">Positions</a>
              </li>
            </ul>
          </div>
        </nav>
      </nav>

      <div className="row">
        <div className="col s12">
          <h4>Holdings</h4>

          {/* Portfolio Summary */}
          <div className="row">
            <div className="col s12 m3">
              <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                  <span className="card-title">Current Value</span>
                  <h5>₹{totalValue.toFixed(2)}</h5>
                </div>
              </div>
            </div>
            <div className="col s12 m3">
              <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                  <span className="card-title">Total Investment</span>
                  <h5>₹{totalInvestment.toFixed(2)}</h5>
                </div>
              </div>
            </div>
            <div className="col s12 m3">
              <div className={`card ${totalPnL >= 0 ? 'green' : 'red'}`}>
                <div className="card-content white-text">
                  <span className="card-title">Total P&L</span>
                  <h5>₹{totalPnL.toFixed(2)}</h5>
                </div>
              </div>
            </div>
            <div className="col s12 m3">
              <div className={`card ${totalPnLPercentage >= 0 ? 'green' : 'red'}`}>
                <div className="card-content white-text">
                  <span className="card-title">Total P&L %</span>
                  <h5>{totalPnLPercentage.toFixed(2)}%</h5>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="card-panel red lighten-4 red-text text-darken-2">
              <p>{error}</p>
            </div>
          )}

          {holdings.length === 0 ? (
            <div className="card">
              <div className="card-content center-align">
                <h5>No Holdings Found</h5>
                <p>You don't have any holdings in your portfolio.</p>
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
                      <th>Current Value</th>
                      <th>P&L</th>
                      <th>P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={`${holding.tradingsymbol}-${index}`}>
                        <td>
                          <strong>{holding.tradingsymbol}</strong>
                          <br />
                          <small className="grey-text">{holding.exchange}</small>
                        </td>
                        <td>{holding.quantity}</td>
                        <td>₹{holding.average_price?.toFixed(2)}</td>
                        <td>₹{holding.last_price?.toFixed(2)}</td>
                        <td>₹{(holding.last_price * holding.quantity).toFixed(2)}</td>
                        <td className={holding.pnl >= 0 ? 'green-text' : 'red-text'}>
                          <strong>₹{holding.pnl?.toFixed(2)}</strong>
                        </td>
                        <td className={holding.pnl_percentage >= 0 ? 'green-text' : 'red-text'}>
                          <strong>{holding.pnl_percentage?.toFixed(2)}%</strong>
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
