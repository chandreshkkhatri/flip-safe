'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import EnhancedCard from '@/components/enhanced-card';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (!checkedLoginStatus || loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <>
      <PageLayout
        title="Flip Safe"
        showNightModeToggle={true}
        onToggleNightMode={toggleNightMode}
        nightMode={nightMode}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">Trading Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to Flip Safe - Your Unified Trading Platform</p>
        </div>

        {/* Feature Cards */}
        <div className="feature-grid">
          <EnhancedCard
            title="Market Watch"
            description="Monitor your favorite instruments in real-time"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/terminal" className="btn blue waves-effect">
                View Terminal
              </Link>
            }
          />

          <EnhancedCard
            title="Orders"
            description="View and manage your trading orders"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/orders" className="btn blue waves-effect">
                View Orders
              </Link>
            }
          />

          <EnhancedCard
            title="Positions"
            description="Track your current trading positions"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/positions" className="btn blue waves-effect">
                View Positions
              </Link>
            }
          />

          <EnhancedCard
            title="Holdings"
            description="Manage your investment portfolio"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/holdings" className="btn blue waves-effect">
                View Holdings
              </Link>
            }
          />

          <EnhancedCard
            title="Alerts"
            description="Set up price alerts and notifications"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/alerts" className="btn blue waves-effect">
                Manage Alerts
              </Link>
            }
          />

          <EnhancedCard
            title="Simulator"
            description="Practice trading with historical data"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/simulator" className="btn blue waves-effect">
                Open Simulator
              </Link>
            }
          />

          <EnhancedCard
            title="Account Management"
            description="Connect and manage multiple trading accounts"
            hoverable={true}
            nightMode={nightMode}
            action={
              <Link href="/accounts" className="btn blue waves-effect">
                Manage Accounts
              </Link>
            }
          />
        </div>

        {/* Status Information */}
        <EnhancedCard title="Connection Status" nightMode={nightMode}>
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
        </EnhancedCard>
      </PageLayout>

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

        @media only screen and (max-width: 768px) {
          .dashboard-title {
            font-size: 2rem;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
