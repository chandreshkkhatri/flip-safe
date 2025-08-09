'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth-context';


export default function DashboardPage() {
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const { isLoggedIn, allowOfflineAccess, checkedLoginStatus, runOfflineMode } = useAuth();

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
    return <LoadingSpinner message="Loading dashboard..." />;
  }


  return (
    <>
      <PageLayout
        title="Flip Safe"
        showNightModeToggle={true}
        showApiConfig={true}
        onToggleNightMode={toggleNightMode}
        onShowApiPanel={() => setShowApiPanel(true)}
        nightMode={nightMode}
      >
      <div className="dashboard-header">
        <h1 className="dashboard-title">Trading Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to Flip Safe - Your Unified Trading Platform</p>
      </div>

      {/* Feature Cards */}
      <div className="feature-grid">
        <Card
          title="Market Watch"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/terminal" className="btn blue waves-effect">View Terminal</Link>}
        >
          <p>Monitor your favorite instruments in real-time</p>
        </Card>

        <Card
          title="Orders"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/orders" className="btn blue waves-effect">View Orders</Link>}
        >
          <p>View and manage your trading orders</p>
        </Card>

        <Card
          title="Positions"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/positions" className="btn blue waves-effect">View Positions</Link>}
        >
          <p>Track your current trading positions</p>
        </Card>

        <Card
          title="Holdings"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/holdings" className="btn blue waves-effect">View Holdings</Link>}
        >
          <p>Manage your investment portfolio</p>
        </Card>

        <Card
          title="Alerts"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/alerts" className="btn blue waves-effect">Manage Alerts</Link>}
        >
          <p>Set up price alerts and notifications</p>
        </Card>

        <Card
          title="Simulator"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/simulator" className="btn blue waves-effect">Open Simulator</Link>}
        >
          <p>Practice trading with historical data</p>
        </Card>

        <Card
          title="Account Management"
          hoverable={true}
          nightMode={nightMode}
          action={<Link href="/accounts" className="btn blue waves-effect">Manage Accounts</Link>}
        >
          <p>Connect and manage multiple trading accounts</p>
        </Card>
      </div>

      {/* Status Information */}
      <Card title="Connection Status" nightMode={nightMode}>
        <div className="status-info">
          <div className="status-item">
            <strong>Mode:</strong>{' '}
            <span className={`status-badge ${isLoggedIn ? 'live' : 'offline'}`}>
              {isLoggedIn ? 'Live Trading' : 'Offline Mode'}
            </span>
          </div>
          {!isLoggedIn && allowOfflineAccess && (
            <div className="status-warning">
              ⚠️ You are in offline mode. Some features may be limited.
            </div>
          )}
        </div>
      </Card>

      </PageLayout>

      {/* API Configuration Modal */}
      <Modal
        isOpen={showApiPanel}
        onClose={() => setShowApiPanel(false)}
        title="API Configuration"
        size="medium"
      >
        <div className="api-config-form">
          <p className="config-description">
            Enter your Zerodha Kite Connect API credentials to enable live trading.
          </p>
          
          <div className="form-group">
            <label htmlFor="api-key">API Key</label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="api-secret">API Secret</label>
            <input
              id="api-secret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your API Secret"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button 
              className="btn blue waves-effect waves-light" 
              onClick={handleApiConfig}
              disabled={!apiKey.trim() || !apiSecret.trim()}
            >
              Configure & Login
            </button>
            <button 
              className="btn-flat waves-effect waves-light" 
              onClick={() => setShowApiPanel(false)}
            >
              Cancel
            </button>
          </div>

          <div className="help-text">
            <p>
              Don&apos;t have API credentials? Visit{' '}
              <a 
                href="https://kite.zerodha.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="link"
              >
                Zerodha Kite Connect
              </a>
              {' '}to create your app.
            </p>
          </div>
        </div>
      </Modal>

    <style jsx>{`
      .dashboard-header {
        text-align: center;
        margin-bottom: 48px;
      }
      
      .dashboard-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #2196f3, #1976d2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .dashboard-subtitle {
        font-size: 1.1rem;
        color: #666;
        margin: 0;
      }
      
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }
      
      .status-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .status-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .status-badge.live {
        background-color: #4caf50;
        color: white;
      }
      
      .status-badge.offline {
        background-color: #ff9800;
        color: white;
      }
      
      .status-warning {
        padding: 12px;
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        color: #856404;
      }
      
      .api-config-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .config-description {
        margin: 0 0 20px 0;
        color: #666;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .form-group label {
        font-weight: 500;
        color: #333;
      }
      
      .form-input {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.2s ease;
      }
      
      .form-input:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 8px;
      }
      
      .help-text {
        padding-top: 16px;
        border-top: 1px solid #eee;
        font-size: 0.9rem;
        color: #666;
      }
      
      .link {
        color: #2196f3;
        text-decoration: none;
      }
      
      .link:hover {
        text-decoration: underline;
      }
      
      @media only screen and (max-width: 768px) {
        .dashboard-title {
          font-size: 2rem;
        }
        
        .feature-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .form-actions {
          flex-direction: column;
        }
      }
    `}</style>
    </>
  );
}
