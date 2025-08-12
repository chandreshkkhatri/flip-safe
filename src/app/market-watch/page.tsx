'use client';

import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { binanceWebSocket } from '@/lib/binance-websocket';
import TradingWindow from '@/components/watchlist/TradingWindow';
import { useAuth } from '@/lib/auth-context';
import { API_ROUTES } from '@/lib/constants';
import { fundsService, FundsData } from '@/lib/funds-service';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface WatchlistItem {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface BinanceAccount {
  _id: string;
  accountName: string;
  accountType: 'binance';
  isActive: boolean;
}

const MAJOR_INDICES = [
  { name: 'NIFTY 50', value: 24500, change: 125.5, changePercent: 0.51 },
  { name: 'SENSEX', value: 80850, change: 420.25, changePercent: 0.52 },
  { name: 'BANK NIFTY', value: 52300, change: -180.75, changePercent: -0.34 },
];

const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT', 
  'BNBUSDT',
  'ADAUSDT',
  'XRPUSDT',
  'SOLUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
];

const TRADING_TIPS = [
  "📊 Never risk more than 2% of your portfolio on a single trade",
  "🎯 Set stop-loss orders for every position to limit downside risk",
  "📈 Diversify across different sectors to reduce concentration risk",
  "⏰ Avoid emotional trading during high volatility periods",
  "📝 Keep a trading journal to learn from wins and losses",
  "💰 Take partial profits when targets are reached",
];

export default function MarketWatchPage() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [selectedTip, setSelectedTip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [fundsData, setFundsData] = useState<FundsData | null>(null);
  const [fundsLoading, setFundsLoading] = useState(true);
  const [fundsError, setFundsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [showTradingWindow, setShowTradingWindow] = useState(false);
  const [binanceAccounts, setBinanceAccounts] = useState<BinanceAccount[]>([]);
  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();

  // Rotate trading tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTip((prev) => (prev + 1) % TRADING_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Binance accounts and funds
  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
    fetchBinanceAccounts();
  }, [isLoggedIn, allowOfflineAccess]);

  // Fetch funds when accounts are loaded
  useEffect(() => {
    const fetchFunds = async () => {
      if (binanceAccounts.length > 0) {
        try {
          setFundsLoading(true);
          setFundsError(null);
          // Use the first active account for funds
          const activeAccount = binanceAccounts.find(acc => acc.isActive) || binanceAccounts[0];
          const funds = await fundsService.fetchBinanceFunds(activeAccount._id);
          setFundsData(funds);
        } catch (error: any) {
          console.error('Error fetching funds:', error);
          // Provide more specific error messages
          if (error.message?.includes('Invalid API')) {
            setFundsError('Invalid API credentials. Please check your Binance API keys in the Accounts page.');
          } else if (error.message?.includes('IP not whitelisted')) {
            setFundsError('IP not whitelisted. Please add your IP to the API key whitelist in Binance.');
          } else if (error.message?.includes('permissions')) {
            setFundsError('Insufficient API permissions. Please enable Futures trading for your API key.');
          } else {
            setFundsError(error.message || 'Failed to fetch account balance');
          }
        } finally {
          setFundsLoading(false);
        }
      } else {
        // No accounts found
        setFundsLoading(false);
        setFundsError('No Binance accounts found. Please add an account in the Accounts page.');
      }
    };

    fetchFunds();
  }, [binanceAccounts]);

  const fetchBinanceAccounts = async () => {
    const userId = 'default_user';
    try {
      const response = await axios.get(`${API_ROUTES.accounts.getAccounts}?userId=${userId}`);
      if (response.data?.success) {
        const binanceAccs = response.data.accounts.filter(
          (acc: any) => acc.accountType === 'binance'
        );
        setBinanceAccounts(binanceAccs);
      }
    } catch (error) {
      console.error('Error fetching Binance accounts:', error);
      // Don't set mock accounts - let the user know they need to add real accounts
      setBinanceAccounts([]);
    }
  };

  // Initialize watchlist
  useEffect(() => {
    const initializeWatchlist = async () => {
      try {
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

        // Start WebSocket connection
        binanceWebSocket.connect(DEFAULT_SYMBOLS, (priceUpdate) => {
          setWatchlistItems(prev =>
            prev.map(item => {
              if (item.symbol === priceUpdate.symbol) {
                const newPrice = parseFloat(priceUpdate.price);
                const oldPrice = item.lastPrice || newPrice;
                const change = newPrice - oldPrice;
                
                return {
                  ...item,
                  lastPrice: newPrice,
                  priceChange: change,
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
      } catch (error) {
        console.error('Failed to initialize market watch:', error);
        setLoading(false);
      }
    };

    initializeWatchlist();

    return () => {
      binanceWebSocket.disconnect();
    };
  }, []);

  const addSymbol = (symbol: string) => {
    if (!watchlistItems.find(item => item.symbol === symbol)) {
      const newItem: WatchlistItem = {
        symbol: symbol.toUpperCase(),
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
  };


  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading market data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="market-watch-container">
        {/* Header with Market Overview */}
        <div className="market-header">
          <div className="header-content">
            <h1>Market Watch</h1>
            <p className="subtitle">Real-time market data with responsible trading insights</p>
          </div>
          
          <div className="indices-grid">
            {MAJOR_INDICES.map((index, i) => (
              <div key={i} className="index-card">
                <div className="index-name">{index.name}</div>
                <div className="index-value">{index.value.toLocaleString()}</div>
                <div className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Tip Banner */}
        <div className="tip-banner">
          <div className="tip-content">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{TRADING_TIPS[selectedTip]}</span>
          </div>
        </div>

        <div className="main-content">
          {/* Watchlist Section */}
          <div className="watchlist-section">
            <div className="section-header">
              <h2>Your Watchlist</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search symbols (e.g., LINKUSDT)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      addSymbol(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (searchQuery.trim()) {
                      addSymbol(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                    }
                  }}
                  disabled={!searchQuery.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="watchlist-table">
              <div className="table-header">
                <div>Symbol</div>
                <div>Price</div>
                <div>24h Change</div>
                <div>Volume</div>
                <div>High/Low</div>
                <div>Action</div>
              </div>
              
              {watchlistItems.map((item) => (
                <div key={item.symbol} className="table-row">
                  <div className="symbol-cell">
                    <span className="symbol-name">{item.symbol}</span>
                  </div>
                  <div className="price-cell">
                    ${item.lastPrice.toFixed(4)}
                  </div>
                  <div className={`change-cell ${item.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                    {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(2)}%
                  </div>
                  <div className="volume-cell">
                    {(item.volume / 1000000).toFixed(2)}M
                  </div>
                  <div className="high-low-cell">
                    <div className="high-low">
                      <span className="high">${item.high24h.toFixed(4)}</span>
                      <span className="low">${item.low24h.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="action-cell">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedSymbol(item.symbol);
                        setShowTradingWindow(true);
                      }}
                      className="trade-btn"
                      style={{ marginRight: '8px' }}
                    >
                      Trade
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSymbol(item.symbol)}
                      className="remove-btn"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Management Panel */}
          <div className="risk-panel">
            <h3>Risk Management Tools</h3>
            
            <div className="portfolio-summary">
              {fundsLoading ? (
                <div className="funds-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading account balance...</span>
                </div>
              ) : fundsError ? (
                <div className="funds-error">
                  <span>⚠️ {fundsError}</span>
                  {fundsError.includes('API') && (
                    <div className="error-action">
                      <a href="/accounts" style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.85rem', marginTop: '8px', display: 'inline-block' }}>
                        Go to Accounts →
                      </a>
                    </div>
                  )}
                </div>
              ) : fundsData ? (
                <>
                  <div className="portfolio-item">
                    <span className="label">Total Balance:</span>
                    <span className="value">${fundsData.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="portfolio-item">
                    <span className="label">Available Balance:</span>
                    <span className="value">${fundsData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="portfolio-item">
                    <span className="label">Unrealized P&L:</span>
                    <span className={`value ${fundsData.totalUnrealizedProfit >= 0 ? 'positive' : 'negative'}`}>
                      ${fundsData.totalUnrealizedProfit >= 0 ? '+' : ''}${fundsData.totalUnrealizedProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="portfolio-item">
                    <span className="label">Max Risk (2%):</span>
                    <span className="value">${(fundsData.totalUsdValue * 0.02).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="portfolio-item">
                  <span className="label">No account data</span>
                  <span className="value">--</span>
                </div>
              )}
            </div>

            <div className="risk-calculator">
              <h4>Position Size Calculator</h4>
              <p className="calculator-desc">Calculate safe position sizes based on your risk tolerance</p>
              
              <div className="risk-examples">
                <div className="risk-example">
                  <span className="risk-label">1% Risk:</span>
                  <span className="risk-amount">${fundsData ? (fundsData.totalUsdValue * 0.01).toFixed(2) : '0.00'}</span>
                </div>
                <div className="risk-example">
                  <span className="risk-label">2% Risk:</span>
                  <span className="risk-amount">${fundsData ? (fundsData.totalUsdValue * 0.02).toFixed(2) : '0.00'}</span>
                </div>
                <div className="risk-example">
                  <span className="risk-label">3% Risk:</span>
                  <span className="risk-amount">${fundsData ? (fundsData.totalUsdValue * 0.03).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="trading-rules">
              <h4>Today's Trading Rules</h4>
              <div className="rule-item">
                <input type="checkbox" id="rule1" />
                <label htmlFor="rule1">Set stop-loss for every position</label>
              </div>
              <div className="rule-item">
                <input type="checkbox" id="rule2" />
                <label htmlFor="rule2">Review risk before each trade</label>
              </div>
              <div className="rule-item">
                <input type="checkbox" id="rule3" />
                <label htmlFor="rule3">Stick to position sizing rules</label>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Window Modal */}
        {showTradingWindow && (
          <div className="trading-modal-overlay" onClick={() => setShowTradingWindow(false)}>
            <div className="trading-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Trade {selectedSymbol}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTradingWindow(false)}
                >
                  ✕
                </Button>
              </div>
              <TradingWindow
                symbol={selectedSymbol}
                currentPrice={watchlistItems.find(item => item.symbol === selectedSymbol)?.lastPrice || 0}
                binanceAccounts={binanceAccounts}
                onOrderPlaced={() => {
                  setShowTradingWindow(false);
                }}
              />
            </div>
          </div>
        )}

        <style jsx>{`
          .market-watch-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
          }

          .market-header {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          :global(.dark) .market-header {
            background: #18181b !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .header-content {
            text-align: center;
            margin-bottom: 20px;
          }

          .header-content h1 {
            font-size: 2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          
          :global(.dark) .header-content h1 {
            color: #ffffff !important;
          }

          .subtitle {
            color: #666;
            font-size: 1rem;
          }
          
          :global(.dark) .subtitle {
            color: #a1a1aa !important;
          }

          .indices-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .index-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }
          
          :global(.dark) .index-card {
            background: #27272a !important;
          }

          .index-name {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 4px;
          }
          
          :global(.dark) .index-name {
            color: #a1a1aa !important;
          }

          .index-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }
          
          :global(.dark) .index-value {
            color: #ffffff !important;
          }

          .index-change {
            font-size: 0.9rem;
            font-weight: 500;
          }

          .index-change.positive {
            color: #16a34a;
          }

          .index-change.negative {
            color: #dc2626;
          }

          .tip-banner {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            border-radius: 12px;
            padding: 16px 24px;
            color: white;
          }

          .tip-content {
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: center;
            justify-content: center;
          }

          .tip-icon {
            font-size: 1.2rem;
          }

          .tip-text {
            font-weight: 500;
            font-size: 1rem;
          }

          .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
          }

          .watchlist-section {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          :global(.dark) .watchlist-section {
            background: #18181b !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .section-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin: 0;
          }
          
          :global(.dark) .section-header h2 {
            color: #ffffff !important;
          }

          .search-container {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .search-input {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 0.9rem;
            width: 200px;
          }
          
          :global(.dark) .search-input {
            background: #27272a !important;
            border: 1px solid #3f3f46 !important;
            color: #ffffff !important;
          }

          .watchlist-table {
            display: flex;
            flex-direction: column;
            gap: 1px;
          }

          .table-header {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr 1fr;
            padding: 12px 16px;
            background: #f8f9fa;
            border-radius: 8px 8px 0 0;
            font-weight: 600;
            font-size: 0.9rem;
            color: #666;
          }
          
          :global(.dark) .table-header {
            background: #27272a !important;
            color: #a1a1aa !important;
          }

          .table-row {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr 1fr;
            padding: 12px 16px;
            background: #ffffff;
            border-bottom: 1px solid #f0f0f0;
            align-items: center;
          }
          
          :global(.dark) .table-row {
            background: #18181b !important;
            border-bottom: 1px solid #27272a !important;
          }

          .table-row:hover {
            background: #f8f9fa;
          }
          
          :global(.dark) .table-row:hover {
            background: #27272a !important;
          }

          .symbol-name {
            font-weight: 600;
            color: #333;
          }
          
          :global(.dark) .symbol-name {
            color: #ffffff !important;
          }

          .price-cell {
            font-weight: 600;
            color: #333;
          }
          
          :global(.dark) .price-cell {
            color: #ffffff !important;
          }

          .change-cell.positive {
            color: #16a34a;
          }

          .change-cell.negative {
            color: #dc2626;
          }

          .volume-cell {
            color: #666;
            font-size: 0.9rem;
          }
          
          :global(.dark) .volume-cell {
            color: #a1a1aa !important;
          }

          .high-low {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .high {
            color: #16a34a;
            font-size: 0.85rem;
          }

          .low {
            color: #dc2626;
            font-size: 0.85rem;
          }

          .action-cell {
            display: flex;
            gap: 4px;
            justify-content: flex-end;
          }

          .trade-btn {
            font-size: 0.8rem;
            padding: 4px 12px;
          }

          .remove-btn {
            color: #dc2626;
            padding: 4px 8px;
          }

          .trading-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .trading-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 1200px;
            width: 100%;
            max-height: 95vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }

          :global(.dark) .trading-modal-content {
            background: #18181b !important;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }

          :global(.dark) .modal-header {
            border-bottom: 1px solid #27272a !important;
          }

          .modal-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
          }

          .funds-loading {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            color: var(--muted-foreground);
            justify-content: center;
          }

          .funds-error {
            padding: 16px;
            color: var(--destructive);
            text-align: center;
            font-size: 0.9rem;
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--muted);
            border-top: 2px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .risk-panel {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            height: fit-content;
          }
          
          :global(.dark) .risk-panel {
            background: #18181b !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .risk-panel h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }
          
          :global(.dark) .risk-panel h3 {
            color: #ffffff !important;
          }

          .portfolio-summary {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          
          :global(.dark) .portfolio-summary {
            background: #27272a !important;
          }

          .portfolio-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .portfolio-item .label {
            color: #666;
            font-size: 0.9rem;
          }
          
          :global(.dark) .portfolio-item .label {
            color: #a1a1aa !important;
          }

          .portfolio-item .value {
            font-weight: 600;
            color: #333;
          }
          
          :global(.dark) .portfolio-item .value {
            color: #ffffff !important;
          }

          .portfolio-item .value.positive {
            color: #16a34a;
          }

          .portfolio-item .value.negative {
            color: #dc2626;
          }

          .risk-calculator {
            margin-bottom: 24px;
          }

          .risk-calculator h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          
          :global(.dark) .risk-calculator h4 {
            color: #ffffff !important;
          }

          .calculator-desc {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 16px;
          }
          
          :global(.dark) .calculator-desc {
            color: #a1a1aa !important;
          }

          .risk-examples {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .risk-example {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f0f9ff;
            border-radius: 6px;
          }
          
          :global(.dark) .risk-example {
            background: #1e3a8a !important;
          }

          .risk-label {
            color: #1e40af;
            font-weight: 500;
          }
          
          :global(.dark) .risk-label {
            color: #60a5fa !important;
          }

          .risk-amount {
            color: #1e40af;
            font-weight: 600;
          }
          
          :global(.dark) .risk-amount {
            color: #93c5fd !important;
          }

          .trading-rules h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
          }
          
          :global(.dark) .trading-rules h4 {
            color: #ffffff !important;
          }

          .rule-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .rule-item label {
            color: #333;
            font-size: 0.9rem;
            cursor: pointer;
          }
          
          :global(.dark) .rule-item label {
            color: #ffffff !important;
          }

          .rule-item input[type="checkbox"] {
            cursor: pointer;
          }

          /* Mobile Responsive */
          @media (max-width: 1024px) {
            .main-content {
              grid-template-columns: 1fr;
            }
            
            .indices-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
          }

          @media (max-width: 768px) {
            .section-header {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }

            .search-container {
              justify-content: stretch;
            }

            .search-input {
              flex: 1;
              width: auto;
            }

            .table-header,
            .table-row {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .table-header {
              display: none;
            }

            .table-row {
              display: flex;
              flex-direction: column;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 8px;
            }

            .symbol-cell {
              font-size: 1.1rem;
              font-weight: 600;
              margin-bottom: 8px;
            }

            .market-header {
              padding: 16px;
            }

            .tip-banner {
              padding: 12px 16px;
            }

            .tip-content {
              flex-direction: column;
              gap: 8px;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
}