'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';

interface TradingWindowProps {
  symbol: string;
  currentPrice: number;
  binanceAccounts: Array<{
    _id: string;
    accountName: string;
    isActive: boolean;
  }>;
  onOrderPlaced: () => void;
}

interface OrderForm {
  accountId: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET';
  quantity: string;
  price: string;
  stopPrice: string;
  leverage: string;
  reduceOnly: boolean;
}

export default function TradingWindow({
  symbol,
  currentPrice,
  binanceAccounts,
  onOrderPlaced,
}: TradingWindowProps) {
  const [orderForm, setOrderForm] = useState<OrderForm>({
    accountId: binanceAccounts[0]?._id || '',
    side: 'BUY',
    type: 'LIMIT',
    quantity: '0.001',
    price: currentPrice.toFixed(2),
    stopPrice: '',
    leverage: '1',
    reduceOnly: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update price when current price changes
  useEffect(() => {
    if (orderForm.type === 'LIMIT') {
      setOrderForm(prev => ({ ...prev, price: currentPrice.toFixed(2) }));
    }
  }, [currentPrice, orderForm.type]);

  const handleInputChange = (field: keyof OrderForm, value: string | boolean) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const calculateOrderValue = () => {
    const qty = parseFloat(orderForm.quantity) || 0;
    const price = orderForm.type === 'MARKET' ? currentPrice : parseFloat(orderForm.price) || 0;
    return (qty * price).toFixed(2);
  };

  const calculateLiquidationPrice = () => {
    const leverage = parseFloat(orderForm.leverage) || 1;
    const entryPrice = orderForm.type === 'MARKET' ? currentPrice : parseFloat(orderForm.price) || currentPrice;
    
    if (orderForm.side === 'BUY') {
      return (entryPrice * (1 - 1/leverage)).toFixed(2);
    } else {
      return (entryPrice * (1 + 1/leverage)).toFixed(2);
    }
  };

  const setQuickQuantity = (percentage: number) => {
    // This would normally calculate based on available balance
    // For now, we'll use sample quantities
    const baseAmount = orderForm.side === 'BUY' ? 100 : 0.1; // $100 for BUY, 0.1 for SELL
    const quantity = ((baseAmount / currentPrice) * (percentage / 100)).toFixed(6);
    handleInputChange('quantity', quantity);
  };

  const submitOrder = async () => {
    if (!orderForm.accountId) {
      setError('Please select a Binance account');
      return;
    }

    if (!orderForm.quantity || parseFloat(orderForm.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (orderForm.type === 'LIMIT' && (!orderForm.price || parseFloat(orderForm.price) <= 0)) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        accountId: orderForm.accountId,
        symbol: symbol,
        side: orderForm.side,
        type: orderForm.type,
        quantity: parseFloat(orderForm.quantity),
        ...(orderForm.type === 'LIMIT' && { price: parseFloat(orderForm.price) }),
        ...(orderForm.type.includes('STOP') && { stopPrice: parseFloat(orderForm.stopPrice) }),
        reduceOnly: orderForm.reduceOnly,
        leverage: parseFloat(orderForm.leverage),
      };

      const response = await axios.post('/api/trading/binance/place-order', orderData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to place order');
      }
      
      setSuccess(`${orderForm.side} order placed successfully for ${orderForm.quantity} ${symbol}`);
      onOrderPlaced();
      
      // Reset form
      setOrderForm(prev => ({
        ...prev,
        quantity: '0.001',
        price: currentPrice.toFixed(2),
        stopPrice: '',
      }));

    } catch (err: any) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (binanceAccounts.length === 0) {
    return (
      <div className="trading-window-empty">
        <p>No Binance accounts available</p>
      </div>
    );
  }

  return (
    <div className="trading-window">
      <div className="trading-header">
        <h3>{symbol} Trading</h3>
        <div className="current-price">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      <div className="trading-form">
        {/* Account Selection */}
        <div className="form-group">
          <label>Account</label>
          <select
            value={orderForm.accountId}
            onChange={(e) => handleInputChange('accountId', e.target.value)}
            className="form-select"
          >
            {binanceAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.accountName}
              </option>
            ))}
          </select>
        </div>

        {/* Order Side */}
        <div className="form-group">
          <label>Side</label>
          <div className="button-group">
            <button
              type="button"
              className={`btn-side ${orderForm.side === 'BUY' ? 'buy selected' : 'buy'}`}
              onClick={() => handleInputChange('side', 'BUY')}
            >
              BUY
            </button>
            <button
              type="button"
              className={`btn-side ${orderForm.side === 'SELL' ? 'sell selected' : 'sell'}`}
              onClick={() => handleInputChange('side', 'SELL')}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div className="form-group">
          <label>Type</label>
          <select
            value={orderForm.type}
            onChange={(e) => handleInputChange('type', e.target.value as any)}
            className="form-select"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="STOP_MARKET">Stop Market</option>
            <option value="TAKE_PROFIT_MARKET">Take Profit</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label>Quantity</label>
          <div className="quantity-input-group">
            <input
              type="number"
              value={orderForm.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="form-input"
              placeholder="0.001"
              step="0.000001"
            />
            <div className="quick-buttons">
              <button type="button" onClick={() => setQuickQuantity(25)}>25%</button>
              <button type="button" onClick={() => setQuickQuantity(50)}>50%</button>
              <button type="button" onClick={() => setQuickQuantity(75)}>75%</button>
              <button type="button" onClick={() => setQuickQuantity(100)}>Max</button>
            </div>
          </div>
        </div>

        {/* Price (for limit orders) */}
        {orderForm.type === 'LIMIT' && (
          <div className="form-group">
            <label>Price (USDT)</label>
            <input
              type="number"
              value={orderForm.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="form-input"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        {/* Stop Price (for stop orders) */}
        {orderForm.type.includes('STOP') && (
          <div className="form-group">
            <label>Stop Price (USDT)</label>
            <input
              type="number"
              value={orderForm.stopPrice}
              onChange={(e) => handleInputChange('stopPrice', e.target.value)}
              className="form-input"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        {/* Leverage */}
        <div className="form-group">
          <label>Leverage</label>
          <select
            value={orderForm.leverage}
            onChange={(e) => handleInputChange('leverage', e.target.value)}
            className="form-select"
          >
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="3">3x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
            <option value="20">20x</option>
            <option value="50">50x</option>
            <option value="100">100x</option>
          </select>
        </div>

        {/* Reduce Only */}
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="reduceOnly"
              checked={orderForm.reduceOnly}
              onChange={(e) => handleInputChange('reduceOnly', e.target.checked)}
              className="form-checkbox"
            />
            <label htmlFor="reduceOnly" className="checkbox-label">
              Reduce Only
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Order Value:</span>
            <span>${calculateOrderValue()}</span>
          </div>
          <div className="summary-row">
            <span>Liquidation Price:</span>
            <span>${calculateLiquidationPrice()}</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Submit Button */}
        <button
          type="button"
          onClick={submitOrder}
          disabled={isSubmitting}
          className={`btn-submit ${orderForm.side.toLowerCase()}`}
        >
          {isSubmitting ? 'Placing Order...' : `${orderForm.side} ${symbol}`}
        </button>
      </div>

      <style jsx>{`
        .trading-window {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .trading-window-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          font-size: 0.9rem;
        }

        .trading-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e9ecef;
          background: white;
        }

        .trading-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #333;
        }

        .current-price {
          font-weight: 600;
          font-size: 1rem;
          color: #2196f3;
        }

        .trading-form {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #333;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.8rem;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }

        .btn-side {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .btn-side.buy {
          color: #4caf50;
          border-color: #4caf50;
        }

        .btn-side.buy.selected {
          background: #4caf50;
          color: white;
        }

        .btn-side.sell {
          color: #f44336;
          border-color: #f44336;
        }

        .btn-side.sell.selected {
          background: #f44336;
          color: white;
        }

        .quantity-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }

        .quick-buttons button {
          padding: 2px 4px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 2px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .quick-buttons button:hover {
          background: #e9ecef;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-checkbox {
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        .checkbox-label {
          cursor: pointer;
          font-size: 0.8rem;
          margin: 0;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 8px;
        }

        .success-message {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 8px;
        }

        .btn-submit {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-submit.buy {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
        }

        .btn-submit.sell {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}