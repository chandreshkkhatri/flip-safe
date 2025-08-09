'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface DashboardProps {}

export default function DashboardPage() {
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { isLoggedIn, allowOfflineAccess, logout, checkedLoginStatus } = useAuth();

  useEffect(() => {
    // Load night mode preference
    const savedNightMode = localStorage.getItem('nightMode') === 'true';
    setNightMode(savedNightMode);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (checkedLoginStatus && !isLoggedIn && !allowOfflineAccess) {
      router.push('/login');
    }
  }, [isLoggedIn, allowOfflineAccess, checkedLoginStatus, router]);

  const toggleNightMode = () => {
    const newNightMode = !nightMode;
    setNightMode(newNightMode);
    localStorage.setItem('nightMode', String(newNightMode));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!checkedLoginStatus || loading) {
    return (
      <div className="loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isLoggedIn && !allowOfflineAccess) {
    return (
      <div className="loading">
        <p>Redirecting to login...</p>
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
                  onClick={handleLogout}
                  className="btn-flat white-text"
                >
                  Logout
                </button>
              </li>
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
      `}</style>
    </div>
  );
}

