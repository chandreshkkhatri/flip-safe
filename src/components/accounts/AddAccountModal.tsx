'use client';

import Modal from '@/components/ui/Modal';
import { useState } from 'react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: {
    accountType: 'kite' | 'upstox' | 'binance';
    accountName: string;
    apiKey: string;
    apiSecret: string;
    redirectUri?: string;
  }) => void;
}

export default function AddAccountModal({ isOpen, onClose, onSubmit }: AddAccountModalProps) {
  const [step, setStep] = useState(1); // Step 1: Select broker, Step 2: Enter credentials
  const [selectedBroker, setSelectedBroker] = useState<'kite' | 'upstox' | 'binance' | null>(null);
  const [formData, setFormData] = useState({
    accountType: 'upstox' as 'kite' | 'upstox' | 'binance',
    accountName: '',
    apiKey: '',
    apiSecret: '',
    redirectUri: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBrokerSelect = (brokerType: 'kite' | 'upstox' | 'binance') => {
    setSelectedBroker(brokerType);
    setFormData(prev => ({ ...prev, accountType: brokerType }));
    setStep(2);
  };

  const handleBackToSelection = () => {
    setStep(1);
    setSelectedBroker(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.accountName.trim()) newErrors.accountName = 'Account name is required';
    if (!formData.apiKey.trim()) newErrors.apiKey = 'API Key is required';
    if (!formData.apiSecret.trim()) newErrors.apiSecret = 'API Secret is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        accountName: formData.accountName.trim(),
        apiKey: formData.apiKey.trim(),
        apiSecret: formData.apiSecret.trim(),
        ...(formData.redirectUri && { redirectUri: formData.redirectUri.trim() }),
      });

      // Reset form
      setStep(1);
      setSelectedBroker(null);
      setFormData({
        accountType: 'upstox',
        accountName: '',
        apiKey: '',
        apiSecret: '',
        redirectUri: '',
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setStep(1);
    setSelectedBroker(null);
    setErrors({});
    setFormData({
      accountType: 'upstox',
      accountName: '',
      apiKey: '',
      apiSecret: '',
      redirectUri: '',
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const brokerOptions = [
    {
      id: 'kite',
      name: 'Zerodha Kite',
      description: "India's largest stock broker",
      icon: '🟢',
      available: true,
      features: ['Stocks', 'Futures', 'Options', 'Commodities'],
    },
    {
      id: 'upstox',
      name: 'Upstox',
      description: 'Technology-first discount broker',
      icon: '🟠',
      available: true,
      features: ['Stocks', 'Futures', 'Options', 'Currency'],
    },
    {
      id: 'binance',
      name: 'Binance Futures',
      description: 'USD-M perpetual futures trading',
      icon: '🟡',
      available: true,
      features: ['USDT Futures', 'Leverage Trading', 'Cross/Isolated Margin', 'API Trading'],
    },
  ];

  const getModalTitle = () => {
    if (step === 1) return 'Choose Trading Platform';
    return `Add ${selectedBroker === 'kite' ? 'Zerodha Kite' : selectedBroker === 'upstox' ? 'Upstox' : selectedBroker === 'binance' ? 'Binance Futures' : 'Trading'} Account`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={getModalTitle()} size="medium">
      {step === 1 ? (
        // Step 1: Broker Selection
        <div className="broker-selection">
          <div className="selection-header">
            <p>Select which trading platform you'd like to connect:</p>
          </div>

          <div className="broker-grid">
            {brokerOptions.map(broker => (
              <div
                key={broker.id}
                className={`broker-card ${!broker.available ? 'disabled' : ''}`}
                onClick={() =>
                  broker.available && handleBrokerSelect(broker.id as 'kite' | 'upstox' | 'binance')
                }
              >
                <div className="broker-header">
                  <span className="broker-icon">{broker.icon}</span>
                  <div className="broker-info">
                    <h3 className="broker-name">{broker.name}</h3>
                    <p className="broker-description">{broker.description}</p>
                  </div>
                  {!broker.available && <span className="coming-soon">Coming Soon</span>}
                </div>

                <div className="broker-features">
                  {broker.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Step 2: Credentials Form
        <form onSubmit={handleSubmit} className="credentials-form">
          <div className="selected-broker-info">
            <span className="selected-icon">
              {brokerOptions.find(b => b.id === selectedBroker)?.icon}
            </span>
            <div>
              <h4>{brokerOptions.find(b => b.id === selectedBroker)?.name}</h4>
              <button type="button" onClick={handleBackToSelection} className="btn-back">
                ← Change Platform
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="form-group">
            <label htmlFor="accountName">Account Name *</label>
            <input
              id="accountName"
              type="text"
              value={formData.accountName}
              onChange={e => handleChange('accountName', e.target.value)}
              placeholder={`e.g., My ${selectedBroker === 'kite' ? 'Kite' : selectedBroker === 'upstox' ? 'Upstox' : 'Binance'} Account`}
              className={`form-input ${errors.accountName ? 'error' : ''}`}
            />
            {errors.accountName && <span className="error-text">{errors.accountName}</span>}
          </div>

          {/* API Key */}
          <div className="form-group">
            <label htmlFor="apiKey">
              {selectedBroker === 'kite'
                ? 'Kite Connect'
                : selectedBroker === 'upstox'
                  ? 'Upstox'
                  : 'Binance'}{' '}
              API Key *
            </label>
            <input
              id="apiKey"
              type="text"
              value={formData.apiKey}
              onChange={e => handleChange('apiKey', e.target.value)}
              placeholder={`Your ${selectedBroker === 'kite' ? 'Kite Connect' : selectedBroker === 'upstox' ? 'Upstox' : 'Binance'} API Key`}
              className={`form-input ${errors.apiKey ? 'error' : ''}`}
            />
            {errors.apiKey && <span className="error-text">{errors.apiKey}</span>}
          </div>

          {/* API Secret */}
          <div className="form-group">
            <label htmlFor="apiSecret">
              {selectedBroker === 'kite'
                ? 'Kite Connect'
                : selectedBroker === 'upstox'
                  ? 'Upstox'
                  : 'Binance'}{' '}
              API Secret *
            </label>
            <input
              id="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={e => handleChange('apiSecret', e.target.value)}
              placeholder={`Your ${selectedBroker === 'kite' ? 'Kite Connect' : selectedBroker === 'upstox' ? 'Upstox' : 'Binance'} API Secret`}
              className={`form-input ${errors.apiSecret ? 'error' : ''}`}
            />
            {errors.apiSecret && <span className="error-text">{errors.apiSecret}</span>}
          </div>

          {/* Testnet Option (for Binance) */}
          {selectedBroker === 'binance' && (
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  id="testnet"
                  type="checkbox"
                  checked={formData.redirectUri === 'testnet'}
                  onChange={e => handleChange('redirectUri', e.target.checked ? 'testnet' : '')}
                  className="form-checkbox"
                />
                <label htmlFor="testnet" className="checkbox-label">
                  Use Testnet (recommended for testing)
                </label>
              </div>
              <small className="form-help">
                Enable this for testing with Binance Testnet. Disable for live trading.
              </small>
            </div>
          )}

          {/* Redirect URI (for OAuth) */}
          {selectedBroker === 'upstox' && (
            <div className="form-group">
              <label htmlFor="redirectUri">Redirect URI (Optional)</label>
              <input
                id="redirectUri"
                type="url"
                value={formData.redirectUri}
                onChange={e => handleChange('redirectUri', e.target.value)}
                placeholder="https://your-domain.com/callback"
                className="form-input"
              />
              <small className="form-help">Leave empty to use default callback URL</small>
            </div>
          )}

          {/* Instructions */}
          <div className="instructions">
            <h4>
              Getting{' '}
              {selectedBroker === 'kite'
                ? 'Kite Connect'
                : selectedBroker === 'upstox'
                  ? 'Upstox'
                  : 'Binance'}{' '}
              API Credentials:
            </h4>
            {selectedBroker === 'upstox' && (
              <div className="instruction-content">
                <p>
                  1. Visit{' '}
                  <a href="https://upstox.com/developer/" target="_blank" rel="noopener noreferrer">
                    Upstox Developer Console
                  </a>
                </p>
                <p>2. Create a new app and get your API credentials</p>
                <p>
                  3. Set redirect URI to:{' '}
                  <code>
                    {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}
                    /api/auth/upstox/callback
                  </code>
                </p>
              </div>
            )}
            {selectedBroker === 'kite' && (
              <div className="instruction-content">
                <p>
                  1. Visit{' '}
                  <a href="https://kite.zerodha.com/apps" target="_blank" rel="noopener noreferrer">
                    Kite Connect Apps
                  </a>
                </p>
                <p>2. Create a new app and get your API credentials</p>
                <p>3. Set redirect URI to your application's callback URL</p>
              </div>
            )}
            {selectedBroker === 'binance' && (
              <div className="instruction-content">
                <p>
                  1. Visit{' '}
                  <a
                    href="https://www.binance.com/en/my/settings/api-management"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Binance API Management
                  </a>
                </p>
                <p>
                  2. Create a new API key with <strong>Futures</strong> permissions enabled
                </p>
                <p>
                  3. For Testnet: Use{' '}
                  <a
                    href="https://testnet.binancefuture.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Binance Testnet
                  </a>
                </p>
                <p>
                  4. <strong>Important:</strong> Enable "Enable Futures" permission for your API key
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Adding Account...'
                : `Add ${selectedBroker === 'kite' ? 'Kite' : selectedBroker === 'upstox' ? 'Upstox' : 'Binance'} Account`}
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .broker-selection {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .selection-header p {
          font-size: 1rem;
          color: #666;
          margin: 0;
          text-align: center;
        }

        .broker-grid {
          display: grid;
          gap: 16px;
        }

        .broker-card {
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .broker-card:hover:not(.disabled) {
          border-color: #2196f3;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(33, 150, 243, 0.15);
        }

        .broker-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f8f9fa;
        }

        .broker-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .broker-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .broker-info {
          flex: 1;
        }

        .broker-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 4px 0;
        }

        .broker-description {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .coming-soon {
          background: #ffeaa7;
          color: #856404;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .broker-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feature-tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .credentials-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .selected-broker-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .selected-icon {
          font-size: 1.5rem;
        }

        .selected-broker-info h4 {
          margin: 0 0 4px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .btn-back {
          background: none;
          border: none;
          color: #2196f3;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .btn-back:hover {
          color: #1976d2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select {
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .form-input.error,
        .form-select.error {
          border-color: #f44336;
        }

        .error-text {
          color: #f44336;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .form-help {
          color: #666;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-checkbox {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .checkbox-label {
          cursor: pointer;
          font-weight: 500;
          margin: 0;
        }

        .instructions {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }

        .instructions h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 0.95rem;
        }

        .instruction-content p {
          margin: 4px 0;
          font-size: 0.9rem;
          color: #555;
        }

        .instruction-content a {
          color: #2196f3;
          text-decoration: none;
        }

        .instruction-content a:hover {
          text-decoration: underline;
        }

        .instruction-content code {
          background: #e9ecef;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .btn-cancel,
        .btn-submit {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-cancel {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #e9ecef;
        }

        .btn-submit {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
}
