'use client';

import { useState } from 'react';
import { IAccount } from '@/models/account';

interface AccountCardProps {
  account: IAccount;
  onEdit: (account: IAccount) => void;
  onDelete: (accountId: string) => void;
  onAuth: (accountId: string) => void;
}

const accountTypeLabels = {
  kite: 'Zerodha Kite',
  upstox: 'Upstox',
  binance: 'Binance',
};

const accountTypeColors = {
  kite: '#4CAF50',
  upstox: '#FF9800',
  binance: '#FFC107',
};

export default function AccountCard({ account, onEdit, onDelete, onAuth }: AccountCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      await onAuth(account._id!);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!account.accessToken;
  const lastSync = account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString() : 'Never';

  return (
    <div className="account-card">
      <div className="account-header">
        <div className="account-type-badge" style={{ backgroundColor: accountTypeColors[account.accountType] }}>
          {accountTypeLabels[account.accountType]}
        </div>
        <div className="account-status">
          <span className={`status-indicator ${isAuthenticated ? 'active' : 'inactive'}`}>
            {isAuthenticated ? '●' : '○'}
          </span>
          <span className="status-text">
            {isAuthenticated ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>

      <div className="account-info">
        <h3 className="account-name">{account.accountName}</h3>
        <div className="account-details">
          <div className="detail-item">
            <span className="detail-label">API Key:</span>
            <span className="detail-value">{account.apiKey.substring(0, 8)}...</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Sync:</span>
            <span className="detail-value">{lastSync}</span>
          </div>
        </div>
      </div>

      <div className="account-actions">
        {!isAuthenticated && account.accountType !== 'kite' && (
          <button
            onClick={handleAuth}
            disabled={isLoading}
            className="btn-auth"
          >
            {isLoading ? 'Connecting...' : 'Connect Account'}
          </button>
        )}
        
        <div className="action-buttons">
          <button
            onClick={() => onEdit(account)}
            className="btn-edit"
            title="Edit Account"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(account._id!)}
            className="btn-delete"
            title="Delete Account"
          >
            🗑️
          </button>
        </div>
      </div>

      <style jsx>{`
        .account-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 2px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .account-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: #e0e0e0;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .account-type-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .account-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
        }

        .status-indicator {
          font-size: 1.2rem;
        }

        .status-indicator.active {
          color: #4CAF50;
        }

        .status-indicator.inactive {
          color: #f44336;
        }

        .status-text {
          font-weight: 500;
          color: #666;
        }

        .account-info {
          margin-bottom: 20px;
        }

        .account-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px 0;
        }

        .account-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          color: #333;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .account-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
        }

        .btn-auth {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          max-width: 150px;
        }

        .btn-auth:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .btn-auth:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-edit,
        .btn-delete {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .btn-edit:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .btn-delete:hover {
          background: #f8d7da;
          border-color: #f5c6cb;
        }

        @media (max-width: 768px) {
          .account-card {
            padding: 16px;
          }

          .account-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .account-actions {
            flex-direction: column;
            gap: 12px;
          }

          .btn-auth {
            max-width: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}