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
      // Get current prices for crypto assets from Binance API
      const symbols = assets
        .filter(asset => asset !== 'USDT' && asset !== 'USD')
        .map(asset => `${asset}USDT`);

      if (symbols.length === 0) return {};

      const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${symbols.map(s => `"${s}"`).join(',')}]`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const priceData = await response.json();
      const prices: Record<string, number> = {};

      // Handle both single symbol and array responses
      const priceArray = Array.isArray(priceData) ? priceData : [priceData];
      
      priceArray.forEach((item: any) => {
        if (item.symbol && item.price) {
          const asset = item.symbol.replace('USDT', '');
          prices[asset] = parseFloat(item.price);
        }
      });

      // USDT is always 1:1 with USD
      prices['USDT'] = 1;
      prices['USD'] = 1;

      return prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      // Fallback prices
      return {
        BTC: 65000,
        ETH: 2500,
        BNB: 300,
        USDT: 1,
        USD: 1,
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
      const response = await fetch(`/api/binance/funds?accountId=${accountId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch funds: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch funds');
      }

      const rawData = result.data;
      
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
      const totalUsdValue = assetsWithUsdValue.reduce((total, asset) => total + asset.usdValue, 0);

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