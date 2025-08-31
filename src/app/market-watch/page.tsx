'use client';

import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import AccountSelector from '@/components/account-selector/AccountSelector';
import Watchlist from '@/components/watchlist/Watchlist';
import { useAuth } from '@/lib/auth-context';
import { useAccount } from '@/lib/account-context';
import { fundsService, FundsData } from '@/lib/funds-service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users, ShieldCheck, TrendingUp } from 'lucide-react';


const TRADING_TIPS = [
  "📊 Never risk more than 2% of your portfolio on a single trade",
  "🎯 Set stop-loss orders for every position to limit downside risk",
  "📈 Diversify across different sectors to reduce concentration risk",
  "⏰ Avoid emotional trading during high volatility periods",
  "📝 Keep a trading journal to learn from wins and losses",
  "💰 Take partial profits when targets are reached",
];

export default function MarketWatchPage() {
  const router = useRouter();
  const [selectedTip, setSelectedTip] = useState(0);
  const [fundsData, setFundsData] = useState<FundsData | null>(null);
  const [fundsLoading, setFundsLoading] = useState(true);
  const [fundsError, setFundsError] = useState<string | null>(null);
  const [marketType] = useState('binance-futures');
  const { isLoggedIn, allowOfflineAccess, runOfflineMode } = useAuth();
  const { selectedAccount, setSelectedAccount, accounts: binanceAccounts, loadingAccounts: accountsLoading } = useAccount();

  // Rotate trading tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTip((prev) => (prev + 1) % TRADING_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle offline mode
  useEffect(() => {
    if (!isLoggedIn && !allowOfflineAccess) {
      runOfflineMode();
    }
  }, [isLoggedIn, allowOfflineAccess]);

  // Fetch funds when selected account changes
  useEffect(() => {
    const fetchFunds = async () => {
      if (selectedAccount) {
        try {
          setFundsLoading(true);
          setFundsError(null);
          const funds = await fundsService.fetchBinanceFunds(selectedAccount._id);
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
      } else if (binanceAccounts.length === 0) {
        // No accounts found
        setFundsLoading(false);
        setFundsError('No Binance accounts found. Please add an account in the Accounts page.');
      } else {
        // Accounts exist but none selected
        setFundsLoading(false);
        setFundsData(null);
        setFundsError(null);
      }
    };

    fetchFunds();
  }, [selectedAccount, binanceAccounts]);




  return (
    <PageLayout>
      <div className="market-watch-container">
        {/* Header */}
        <div className="market-header">
          <div className="header-content">
            <h1>Market Watch</h1>
            <p className="subtitle">Real-time market data for your selected account</p>
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
          {/* Watchlist Section or Market Overview */}
          <div className="watchlist-section">
            {selectedAccount ? (
              <Watchlist 
                binanceAccounts={binanceAccounts}
                selectedAccount={selectedAccount}
                marketType={marketType}
              />
            ) : (
              <div className="no-account-view">
                {binanceAccounts.length === 0 ? (
                  /* No Accounts Available */
                  <div className="empty-state">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2>Welcome to Market Watch</h2>
                    <p className="empty-description">
                      Connect your Binance account to start monitoring your personalized watchlist with real-time market data.
                    </p>
                    
                    <div className="features-grid">
                      <div className="feature-card">
                        <TrendingUp className="feature-icon" size={24} />
                        <h3>Real-time Data</h3>
                        <p>Live price updates and market movements for your selected symbols</p>
                      </div>
                      <div className="feature-card">
                        <Users className="feature-icon" size={24} />
                        <h3>Personalized Watchlist</h3>
                        <p>Create custom watchlists for each of your trading accounts</p>
                      </div>
                      <div className="feature-card">
                        <ShieldCheck className="feature-icon" size={24} />
                        <h3>Secure Trading</h3>
                        <p>Your API keys are encrypted and secure</p>
                      </div>
                    </div>

                    <Button 
                      size="lg"
                      variant="default"
                      onClick={() => router.push('/accounts')}
                      className="cta-button mt-6"
                    >
                      Add Binance Account
                    </Button>
                  </div>
                ) : (
                  /* Accounts Available but None Selected */
                  <div className="empty-state">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-gray-600" />
                    </div>
                    <h2>Select Your Account</h2>
                    <p className="empty-description">
                      Choose an account from the dropdown above to view your personalized watchlist and start trading.
                    </p>
                    
                    <div className="select-account-prompt">
                      <p>👆 Select an account from the dropdown above to get started</p>
                    </div>
                    
                    <div className="mt-6 text-sm text-gray-500">
                      Found {binanceAccounts.length} connected account{binanceAccounts.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Risk Management Panel */}
          <div className="risk-panel">
            <h3>Risk Management Tools</h3>
            
            <div className="portfolio-summary">
              {!selectedAccount ? (
                <div className="no-account-selected">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Select an account to view balance</p>
                    </div>
                  </div>
                </div>
              ) : fundsLoading ? (
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
            flex: 1;
          }

          .no-account-view {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 500px;
            padding: 40px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          :global(.dark) .no-account-view {
            background: #18181b !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .empty-state {
            text-align: center;
            max-width: 600px;
          }

          .empty-icon {
            color: #3b82f6;
            margin-bottom: 24px;
          }

          .empty-state h2 {
            font-size: 2rem;
            font-weight: 600;
            color: #333;
            margin: 0 0 16px 0;
          }

          :global(.dark) .empty-state h2 {
            color: #ffffff !important;
          }

          .empty-description {
            font-size: 1.1rem;
            color: #666;
            margin: 0 0 40px 0;
            line-height: 1.6;
          }

          :global(.dark) .empty-description {
            color: #a1a1aa !important;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
          }

          .feature-card {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e5e5e5;
          }

          :global(.dark) .feature-card {
            background: #27272a !important;
            border: 1px solid #3f3f46 !important;
          }

          .feature-icon {
            color: #3b82f6;
            margin-bottom: 12px;
          }

          .feature-card h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
            margin: 0 0 8px 0;
          }

          :global(.dark) .feature-card h3 {
            color: #ffffff !important;
          }

          .feature-card p {
            font-size: 0.9rem;
            color: #666;
            margin: 0;
            line-height: 1.4;
          }

          :global(.dark) .feature-card p {
            color: #a1a1aa !important;
          }

          .cta-button {
            margin-top: 20px;
          }

          .select-account-prompt {
            padding: 16px;
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 12px;
            margin-top: 20px;
          }

          :global(.dark) .select-account-prompt {
            background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
          }

          .select-account-prompt p {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
            color: #1e40af;
          }

          :global(.dark) .select-account-prompt p {
            color: #93c5fd !important;
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
            
            .account-selector-wrapper {
              flex-direction: column;
              gap: 8px;
            }

            .features-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
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

            .no-account-view {
              padding: 24px;
              min-height: 400px;
            }

            .empty-state h2 {
              font-size: 1.5rem;
            }

            .empty-description {
              font-size: 1rem;
            }

            .features-grid {
              gap: 16px;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
}