'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AccountCard from '@/components/accounts/AccountCard';
import AddAccountModal from '@/components/accounts/AddAccountModal';
import { IAccount } from '@/models/account';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock user ID - in a real app, this would come from auth context
  const userId = 'default_user';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounts?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        setError(data.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (accountData: {
    accountType: 'kite' | 'upstox' | 'binance';
    accountName: string;
    apiKey: string;
    apiSecret: string;
    redirectUri?: string;
  }) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...accountData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchAccounts(); // Refresh accounts list
        setShowAddModal(false);
      } else {
        throw new Error(data.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      alert(error.message || 'Failed to create account');
    }
  };

  const handleEditAccount = (account: IAccount) => {
    // TODO: Implement edit functionality
    console.log('Edit account:', account);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchAccounts(); // Refresh accounts list
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Failed to delete account');
    }
  };

  const handleAuthAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/auth/upstox/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();
      
      if (data.success && data.loginUrl) {
        // Redirect to broker's OAuth page
        window.location.href = data.loginUrl;
      } else {
        throw new Error(data.error || 'Failed to initiate authentication');
      }
    } catch (error: any) {
      console.error('Error authenticating account:', error);
      alert(error.message || 'Failed to authenticate account');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading accounts..." />;
  }

  return (
    <PageLayout title="Account Management">
      <div className="accounts-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Trading Accounts</h1>
            <p>Manage your connected trading accounts and credentials</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-add-account"
          >
            + Add Account
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <h3>No Trading Accounts</h3>
              <p>
                Connect your first trading account to start managing your portfolio across multiple brokers.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-get-started"
              >
                Add Your First Account
              </button>
            </div>
          </Card>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                onAuth={handleAuthAccount}
              />
            ))}
          </div>
        )}

        {/* Account Statistics */}
        {accounts.length > 0 && (
          <div className="account-stats">
            <Card title="Account Overview">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{accounts.length}</div>
                  <div className="stat-label">Total Accounts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {accounts.filter(acc => acc.accessToken).length}
                  </div>
                  <div className="stat-label">Connected</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {accounts.filter(acc => acc.accountType === 'upstox').length}
                  </div>
                  <div className="stat-label">Upstox</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {accounts.filter(acc => acc.accountType === 'kite').length}
                  </div>
                  <div className="stat-label">Kite</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAccount}
        />
      </div>

      <style jsx>{`
        .accounts-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #333;
        }

        .header-content p {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .btn-add-account {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add-account:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(33, 150, 243, 0.3);
        }

        .error-message {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          color: #856404;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          font-size: 1rem;
          color: #666;
          margin: 0 0 24px 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .btn-get-started {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-get-started:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .account-stats {
          margin-top: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2196f3;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .accounts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
      `}</style>
    </PageLayout>
  );
}