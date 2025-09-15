export interface FundsData {
  totalWalletBalance: number;
  totalMarginBalance: number;
  totalUnrealizedProfit: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  assets: Array<{
    asset: string;
    walletBalance: number;
    unrealizedProfit: number;
    marginBalance: number;
    availableBalance: number;
    usdValue?: number; // Calculated USD value
  }>;
  totalUsdValue: number; // Total portfolio value in USD
}

export interface BinanceAccount {
  _id: string;
  accountName: string;
  accountType: 'binance';
  isActive: boolean;
}

class FundsService {
  private static instance: FundsService;
  private fundsCache: Map<string, { data: FundsData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  public static getInstance(): FundsService {
    if (!FundsService.instance) {
      FundsService.instance = new FundsService();
    }
    return FundsService.instance;
  }

  private async fetchCryptoPrices(assets: string[]): Promise<Record<string, number>> {
    try {
      // Use our API endpoint to avoid CORS issues
      const symbolsParam = assets.join(',');
      console.log('Fetching prices for assets:', assets);
      console.log('Assets array contents:', assets.map((asset, i) => `${i}: ${asset}`).join(', '));
      const response = await fetch(`/api/binance/prices?symbols=${symbolsParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('Price fetch failed:', data.error);
        console.error('Full error response:', data);
        return data.prices || {};
      }
      
      return data.prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      // Fallback prices
      return {
        BTC: 65000,
        ETH: 2500,
        BNB: 300,
        USDT: 1,
        USD: 1,
        USDC: 1,
      };
    }
  }

  async fetchBinanceFunds(accountId: string, useCache: boolean = true): Promise<FundsData> {
    // Check cache first
    if (useCache && this.fundsCache.has(accountId)) {
      const cached = this.fundsCache.get(accountId)!;
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`/api/funds?vendor=binance&accountId=${accountId}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        // If it's an authentication error, provide a clear message
        if (response.status === 401 || result.error?.includes('Invalid API')) {
          throw new Error('Invalid API credentials. Please reconnect your Binance account.');
        }
        throw new Error(result.error || result.details || 'Failed to fetch funds');
      }

      const rawData = result.data.details; // Access the raw vendor data

      // Get current crypto prices
      const assetSymbols = rawData.assets.map((asset: any) => asset.asset);
      const prices = await this.fetchCryptoPrices(assetSymbols);

      // Calculate USD values for each asset
      const assetsWithUsdValue = rawData.assets.map((asset: any) => {
        const price = prices[asset.asset] || 0;
        const walletBalance = parseFloat(asset.walletBalance);
        const usdValue = walletBalance * price;

        return {
          asset: asset.asset,
          walletBalance: walletBalance,
          unrealizedProfit: parseFloat(asset.unrealizedProfit),
          marginBalance: parseFloat(asset.marginBalance),
          availableBalance: parseFloat(asset.availableBalance),
          usdValue,
        };
      });

      // Calculate total USD value
      const totalUsdValue = assetsWithUsdValue.reduce((total: number, asset: any) => total + asset.usdValue, 0);

      const fundsData: FundsData = {
        totalWalletBalance: parseFloat(rawData.totalWalletBalance),
        totalMarginBalance: parseFloat(rawData.totalMarginBalance),
        totalUnrealizedProfit: parseFloat(rawData.totalUnrealizedProfit),
        availableBalance: parseFloat(rawData.availableBalance),
        maxWithdrawAmount: parseFloat(rawData.maxWithdrawAmount),
        assets: assetsWithUsdValue,
        totalUsdValue,
      };

      // Cache the result
      this.fundsCache.set(accountId, {
        data: fundsData,
        timestamp: Date.now(),
      });

      return fundsData;

    } catch (error) {
      console.error('Error fetching Binance funds:', error);
      throw error;
    }
  }

  async fetchAllAccountsFunds(accounts: BinanceAccount[]): Promise<Record<string, FundsData>> {
    const results: Record<string, FundsData> = {};

    const promises = accounts.map(async (account) => {
      try {
        const funds = await this.fetchBinanceFunds(account._id);
        results[account._id] = funds;
      } catch (error) {
        console.error(`Error fetching funds for account ${account._id}:`, error);
      }
    });

    await Promise.all(promises);
    return results;
  }

  clearCache(accountId?: string): void {
    if (accountId) {
      this.fundsCache.delete(accountId);
    } else {
      this.fundsCache.clear();
    }
  }
}

export const fundsService = FundsService.getInstance();