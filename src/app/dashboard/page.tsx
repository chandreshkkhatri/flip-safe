'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface DashboardProps {}

export default function DashboardPage() {
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const router = useRouter();
  const { isLoggedIn, allowOfflineAccess, logout, checkedLoginStatus, runOfflineMode } = useAuth();

  useEffect(() => {
    // Load night mode preference
    const savedNightMode = localStorage.getItem('nightMode') === 'true';
    setNightMode(savedNightMode);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Allow offline access by default for the dashboard
    if (checkedLoginStatus && !isLoggedIn && !allowOfflineAccess) {
      // Auto-enable offline mode instead of redirecting to login
      runOfflineMode();
    }
  }, [isLoggedIn, allowOfflineAccess, checkedLoginStatus, runOfflineMode]);

  const toggleNightMode = () => {
    const newNightMode = !nightMode;
    setNightMode(newNightMode);
    localStorage.setItem('nightMode', String(newNightMode));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Don't redirect to login, just stay on dashboard
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleApiConfig = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      alert('Please enter both API Key and API Secret');
      return;
    }

    try {
      // Set login info with API credentials
      const response = await fetch('/api/auth/set-login-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
        }),
      });

      if (response.ok) {
        setShowApiPanel(false);
        setApiKey('');
        setApiSecret('');
        // Trigger auth status check to get login URL
        window.location.reload();
      } else {
        alert('Failed to configure API credentials');
      }
    } catch (error) {
      console.error('Error configuring API:', error);
      alert('Error configuring API credentials');
    }
  };

  if (!checkedLoginStatus || loading) {
    return (
      <div className="loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }


  return (
    <div className={`dashboard ${nightMode ? 'night-mode' : ''}`}>
      {/* Navigation Bar */}
      <nav className="navbar-fixed">
        <nav className={nightMode ? 'grey darken-4' : 'blue'}>
          <div className="nav-wrapper container">
            <Link href="/dashboard" className="brand-logo">
              Flip Safe
            </Link>

            <ul className="right">
              <li>
                <button
                  onClick={toggleNightMode}
                  className="btn-flat white-text"
                  title={nightMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {nightMode ? '☀️' : '🌙'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowApiPanel(true)}
                  className="btn-flat white-text"
                  title="Configure API"
                >
                  ⚙️ API Config
                </button>
              </li>
              {isLoggedIn && (
                <li>
                  <button onClick={handleLogout} className="btn-flat white-text">
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '80px' }}>
        <div className="row">
          <div className="col s12">
            <h4>Trading Dashboard</h4>
            <p>Welcome to Flip Safe - Your Unified Trading Platform</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="row">
          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Market Watch</span>
                <p>Monitor your favorite instruments in real-time</p>
              </div>
              <div className="card-action">
                <Link href="/terminal">View Terminal</Link>
              </div>
            </div>
          </div>

          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Orders</span>
                <p>View and manage your trading orders</p>
              </div>
              <div className="card-action">
                <Link href="/orders">View Orders</Link>
              </div>
            </div>
          </div>

          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Positions</span>
                <p>Track your current trading positions</p>
              </div>
              <div className="card-action">
                <Link href="/positions">View Positions</Link>
              </div>
            </div>
          </div>

          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Holdings</span>
                <p>Manage your investment portfolio</p>
              </div>
              <div className="card-action">
                <Link href="/holdings">View Holdings</Link>
              </div>
            </div>
          </div>

          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Alerts</span>
                <p>Set up price alerts and notifications</p>
              </div>
              <div className="card-action">
                <Link href="/alerts">Manage Alerts</Link>
              </div>
            </div>
          </div>

          <div className="col s12 m6 l4">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Simulator</span>
                <p>Practice trading with historical data</p>
              </div>
              <div className="card-action">
                <Link href="/simulator">Open Simulator</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="row">
          <div className="col s12">
            <div className={`card ${nightMode ? 'grey darken-3' : ''}`}>
              <div className="card-content">
                <span className="card-title">Connection Status</span>
                <p>
                  <strong>Mode:</strong> {isLoggedIn ? 'Live Trading' : 'Offline Mode'}
                </p>
                {!isLoggedIn && allowOfflineAccess && (
                  <p className="orange-text">
                    You are in offline mode. Some features may be limited.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* API Configuration Modal */}
      {showApiPanel && (
        <div className="modal-overlay" onClick={() => setShowApiPanel(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card">
              <div className="card-content">
                <span className="card-title">
                  API Configuration
                  <button 
                    className="btn-flat right" 
                    onClick={() => setShowApiPanel(false)}
                  >
                    ✕
                  </button>
                </span>
                <p>Enter your Zerodha Kite Connect API credentials to enable live trading.</p>
                
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="api-key"
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API Key"
                    />
                    <label htmlFor="api-key" className="active">API Key</label>
                  </div>
                </div>

                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="api-secret"
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter your API Secret"
                    />
                    <label htmlFor="api-secret" className="active">API Secret</label>
                  </div>
                </div>

                <div className="row">
                  <div className="col s12">
                    <button 
                      className="btn blue waves-effect waves-light" 
                      onClick={handleApiConfig}
                      disabled={!apiKey.trim() || !apiSecret.trim()}
                    >
                      Configure & Login
                    </button>
                    <button 
                      className="btn-flat waves-effect waves-light right" 
                      onClick={() => setShowApiPanel(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="row">
                  <div className="col s12">
                    <p className="grey-text text-darken-2">
                      <small>
                        Don&apos;t have API credentials? Visit{' '}
                        <a href="https://kite.zerodha.com/apps" target="_blank" rel="noopener noreferrer">
                          Zerodha Kite Connect
                        </a>
                        {' '}to create your app.
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard.night-mode {
          background-color: #121212;
          color: #ffffff;
          min-height: 100vh;
        }
        .dashboard.night-mode .card {
          background-color: #1e1e1e;
          color: #ffffff;
        }
        .dashboard.night-mode .card-title {
          color: #ffffff;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .modal-content .card {
          margin: 0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
