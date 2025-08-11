'use client';

import { Button } from '@/components/ui/button';
import { binanceWebSocket } from '@/lib/binance-websocket';
import { useEffect, useState } from 'react';
import TradingWindow from './TradingWindow';

export interface WatchlistItem {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
}

interface WatchlistProps {
  binanceAccounts: Array<{
    _id: string;
    accountName: string;
    isActive: boolean;
  }>;
}

const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'ADAUSDT',
  'XRPUSDT',
  'SOLUSDT',
  'DOTUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'MATICUSDT',
];

export default function Watchlist({ binanceAccounts }: WatchlistProps) {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with default symbols and set up WebSocket
  useEffect(() => {
    const initializeWatchlist = async () => {
      try {
        // Initialize with default symbols
        const initialData: WatchlistItem[] = DEFAULT_SYMBOLS.map(symbol => ({
          symbol,
          lastPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          volume: 0,
          high24h: 0,
          low24h: 0,
        }));

        setWatchlistItems(initialData);
        setLoading(false);

        // Start WebSocket connection for real-time updates
        binanceWebSocket.connect(DEFAULT_SYMBOLS, priceUpdate => {
          setWatchlistItems(prev =>
            prev.map(item => {
              if (item.symbol === priceUpdate.symbol) {
                return {
                  ...item,
                  lastPrice: parseFloat(priceUpdate.price),
                  priceChange:
                    parseFloat(priceUpdate.price) *
                    (parseFloat(priceUpdate.priceChangePercent) / 100),
                  priceChangePercent: parseFloat(priceUpdate.priceChangePercent),
                  volume: parseFloat(priceUpdate.volume),
                  high24h: parseFloat(priceUpdate.high),
                  low24h: parseFloat(priceUpdate.low),
                };
              }
              return item;
            })
          );
        });
      } catch (err) {
        // eslint-disable-next-line no-console -- surfaced during init for debugging failures
        console.error('Watchlist init failed', err);
        setError('Failed to initialize price data');
        setLoading(false);
      }
    };

    initializeWatchlist();

    // Cleanup WebSocket on component unmount
    return () => {
      binanceWebSocket.disconnect();
    };
  }, []);

  const addSymbol = (symbol: string) => {
    if (!watchlistItems.find(item => item.symbol === symbol)) {
      const newItem: WatchlistItem = {
        symbol,
        lastPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        volume: 0,
        high24h: 0,
        low24h: 0,
      };
      setWatchlistItems(prev => [...prev, newItem]);
      binanceWebSocket.addSymbol(symbol);
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlistItems(prev => prev.filter(item => item.symbol !== symbol));
    binanceWebSocket.removeSymbol(symbol);
    if (selectedSymbol === symbol && watchlistItems.length > 1) {
      setSelectedSymbol(watchlistItems.find(item => item.symbol !== symbol)?.symbol || 'BTCUSDT');
    }
  };

  if (loading) {
    return (
      <div className="watchlist-container">
        <div className="loading-state">Loading market data...</div>
      </div>
    );
  }

  if (binanceAccounts.length === 0) {
    return (
      <div className="watchlist-container">
        <div className="no-accounts">
          <h3>Binance Trading</h3>
          <p>Connect a Binance account to start trading futures</p>
          <Button variant="trading" size="sm">
            Add Binance Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-panel">
        <div className="watchlist-header">
          <h3>Market Watch</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Basic prompt kept for now; replace with proper modal later.
              // eslint-disable-next-line no-alert
              const symbol = prompt('Enter symbol (e.g., LINKUSDT):');
              if (symbol) addSymbol(symbol.toUpperCase());
            }}
          >
            + Add
          </Button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="watchlist-items">
          {watchlistItems.map(item => (
            <div
              key={item.symbol}
              className={`watchlist-item ${selectedSymbol === item.symbol ? 'selected' : ''}`}
              onClick={() => setSelectedSymbol(item.symbol)}
            >
              <div className="symbol-row">
                <div className="symbol-info">
                  <span className="symbol-name">{item.symbol}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      removeSymbol(item.symbol);
                    }}
                  >
                    ×
                  </Button>
                </div>
                <div className="price-info">
                  <span className="last-price">${item.lastPrice.toFixed(2)}</span>
                  <span
                    className={`price-change ${item.priceChange >= 0 ? 'positive' : 'negative'}`}
                  >
                    {item.priceChange >= 0 ? '+' : ''}
                    {item.priceChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="volume-info">Vol: {(item.volume / 1000000).toFixed(2)}M</div>
            </div>
          ))}
        </div>
      </div>

      <div className="trading-panel">
        <TradingWindow
          symbol={selectedSymbol}
          currentPrice={watchlistItems.find(item => item.symbol === selectedSymbol)?.lastPrice || 0}
          binanceAccounts={binanceAccounts}
          onOrderPlaced={() => {
            // Refresh data or show success message
            // eslint-disable-next-line no-console -- user feedback placeholder
            console.log('Order placed successfully');
          }}
        />
      </div>

      <style jsx>{`
        .watchlist-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 16px;
          height: 600px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #666;
          font-size: 0.9rem;
        }

        .no-accounts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 32px;
          text-align: center;
        }

        .no-accounts h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .no-accounts p {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 0.9rem;
        }

        /* Add account button migrated to Button */

        .watchlist-panel {
          border-right: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
        }

        .watchlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .watchlist-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #333;
        }

        /* Add symbol button migrated to Button */

        .error-message {
          background: #fff3cd;
          color: #856404;
          padding: 8px 16px;
          border-bottom: 1px solid #ffeaa7;
          font-size: 0.8rem;
        }

        .watchlist-items {
          flex: 1;
          overflow-y: auto;
        }

        .watchlist-item {
          padding: 8px 16px;
          border-bottom: 1px solid #f1f3f4;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .watchlist-item:hover {
          background: #f8f9fa;
        }

        .watchlist-item.selected {
          background: #e3f2fd;
          border-left: 3px solid #2196f3;
        }

        .symbol-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .symbol-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .symbol-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #333;
        }

        /* Remove symbol button migrated to Button */

        .price-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .last-price {
          font-weight: 600;
          font-size: 0.8rem;
          color: #333;
        }

        .price-change {
          font-size: 0.7rem;
          font-weight: 500;
        }

        .price-change.positive {
          color: #4caf50;
        }

        .price-change.negative {
          color: #f44336;
        }

        .volume-info {
          font-size: 0.7rem;
          color: #666;
        }

        .trading-panel {
          background: #fafafa;
          display: flex;
          flex-direction: column;
        }

        @media only screen and (max-width: 768px) {
          .watchlist-container {
            grid-template-columns: 1fr;
            grid-template-rows: 250px 1fr;
            height: auto;
          }

          .watchlist-panel {
            border-right: none;
            border-bottom: 1px solid #e9ecef;
          }
        }
      `}</style>
    </div>
  );
}
