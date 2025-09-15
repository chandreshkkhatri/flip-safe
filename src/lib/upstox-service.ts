import limiter from './limiter';

// Import Upstox SDK components
const UpstoxClient = require('upstox-js-sdk');

// Define types for Upstox responses
export interface UpstoxOrder {
  order_id: string;
  exchange_order_id: string;
  placed_by: string;
  variety: string;
  status: string;
  tag: string;
  exchange: string;
  instrument_token: string;
  trading_symbol: string;
  order_type: string;
  transaction_type: string;
  validity: string;
  product: string;
  quantity: number;
  disclosed_quantity: number;
  price: number;
  trigger_price: number;
  average_price: number;
  filled_quantity: number;
  pending_quantity: number;
  order_timestamp: string;
  exchange_timestamp: string;
  status_message: string;
}

export interface UpstoxPosition {
  exchange: string;
  multiplier: number;
  value: number;
  pnl: number;
  product: string;
  instrument_token: string;
  average_price: number;
  buy_value: number;
  overnight_quantity: number;
  day_buy_value: number;
  day_buy_price: number;
  overnight_buy_amount: number;
  overnight_buy_quantity: number;
  day_buy_quantity: number;
  day_sell_value: number;
  day_sell_price: number;
  overnight_sell_amount: number;
  overnight_sell_quantity: number;
  day_sell_quantity: number;
  quantity: number;
  last_price: number;
  unrealised: number;
  realised: number;
  sell_value: number;
  tradingsymbol: string;
  trading_symbol: string;
  close_price: number;
  buy_price: number;
  sell_price: number;
}

export interface UpstoxHolding {
  isin: string;
  cnc_used_quantity: number;
  collateral_type: string;
  company_name: string;
  haircut: number;
  product: string;
  quantity: number;
  tradingsymbol: string;
  trading_symbol: string;
  last_price: number;
  close_price: number;
  average_price: number;
  collateral_quantity: number;
  collateral_update_quantity: number;
  t1_quantity: number;
  exchange: string;
  instrument_token: string;
  pnl: number;
}

export interface UpstoxFunds {
  equity: {
    used_margin: number;
    payin_amount: number;
    span_margin: number;
    adhoc_margin: number;
    notional_cash: number;
    available_margin: number;
    exposure_margin: number;
    option_premium: number;
    collateral_amount: number;
    coverage_margin: number;
    liquidity_before: number;
    cash_deposit: number;
    liquid_collateral: number;
    stock_collateral: number;
    unrealized_mtm: number;
    realized_mtm: number;
    opening_balance: number;
    payin_amount_t1: number;
    payin_amount_t0: number;
    additional_leverage_amount: number;
    utilized_amount: number;
    available_credits: number;
  };
  _serviceHoursError?: boolean;
  _errorMessage?: string;
}

export interface UpstoxOrderParams {
  quantity: number;
  product: 'I' | 'D' | 'CO' | 'OCO';
  validity: 'DAY' | 'IOC';
  price: number;
  tag?: string;
  instrument_token: string;
  order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  transaction_type: 'BUY' | 'SELL';
  disclosed_quantity?: number;
  trigger_price?: number;
  is_amo?: boolean;
}

/**
 * Upstox Service - Unified service for all Upstox operations
 * Implements Upstox API v2 with proper typing and error handling
 */
class UpstoxService {
  private client: any;
  private accessToken: string | null = null;
  private apiKey: string | null = null;
  private apiSecret: string | null = null;
  private isSandbox: boolean = false;
  private static instance: UpstoxService;

  private constructor() {
    // Initialize without credentials - will be set later
    this.client = null;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UpstoxService {
    if (!UpstoxService.instance) {
      UpstoxService.instance = new UpstoxService();
    }
    return UpstoxService.instance;
  }

  /**
   * Initialize with API credentials from account
   */
  public initializeWithCredentials(apiKey: string, apiSecret: string, isSandbox: boolean = false): void {
    console.log('Initializing Upstox with credentials');
    console.log('UpstoxClient available:', !!UpstoxClient);
    console.log('API Key provided:', !!apiKey);
    console.log('API Secret provided:', !!apiSecret);
    console.log('Is Sandbox:', isSandbox);

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isSandbox = isSandbox;

    try {
      // Initialize the API client with sandbox flag
      // According to SDK docs: new UpstoxClient.ApiClient(true) for sandbox
      this.client = new UpstoxClient.ApiClient(isSandbox);

      if (isSandbox) {
        console.log('Using Upstox SANDBOX environment');
      } else {
        console.log('Using Upstox PRODUCTION environment');
      }

      console.log('Upstox client initialized successfully');
    } catch (error) {
      console.error('Error creating Upstox client:', error);
      throw error;
    }
  }

  /**
   * Get the Upstox client instance
   */
  getUpstoxClient(): any {
    if (!this.client) {
      throw new Error('Upstox client not initialized. Call initializeWithCredentials() first.');
    }
    return this.client;
  }

  /**
   * Reset the service (logout)
   */
  reset(): void {
    this.accessToken = null;
    // Reinitialize client if credentials are available
    if (this.apiKey) {
      this.client = new UpstoxClient.ApiClient();
      this.client.basePath = 'https://api.upstox.com/v2';
    }
  }

  /**
   * Set access token after authentication
   */
  setAccessToken(accessToken: string): void {
    console.log('Setting Upstox access token');
    console.log('Access token provided:', !!accessToken);
    console.log('Upstox client available:', !!this.client);

    try {
      this.accessToken = accessToken;
      // Configure OAuth2 authentication
      const oauth = this.client.authentications['OAUTH2'];
      oauth.accessToken = accessToken;

      console.log('Upstox access token set successfully');
    } catch (error) {
      console.error('Error setting Upstox access token:', error);
      throw error;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get login URL for user authentication
   */
  getLoginURL(): string {
    if (!this.apiKey) {
      throw new Error('API key not set. Call initializeWithCredentials() first.');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/upstox/callback`;

    // Sandbox apps need to use a minimal scope or specific test scope
    // According to Upstox SDK docs, sandbox might require different scope handling
    const scope = this.isSandbox ? 'NSE|BSE' : 'NSE|BSE|NFO|CDS|MCX|BFO';

    // Use sandbox OAuth domain for sandbox apps
    // This matches the client base path that the SDK automatically sets
    const authDomain = this.isSandbox ? 'https://api-sandbox.upstox.com' : 'https://api.upstox.com';

    console.log('=== Upstox Login URL Debug ===');
    console.log('Environment:', this.isSandbox ? 'SANDBOX' : 'PRODUCTION');
    console.log('Auth Domain:', authDomain);
    console.log('Base URL:', baseUrl);
    console.log('Redirect URI (raw):', redirectUri);
    console.log('Redirect URI (encoded):', encodeURIComponent(redirectUri));
    console.log('Client ID:', this.apiKey);
    console.log('Client ID length:', this.apiKey?.length);
    console.log('Client ID format check (UUID-like):', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.apiKey));
    console.log('Scope (raw):', scope);
    console.log('Scope (encoded):', encodeURIComponent(scope));

    // Try to validate redirect URI format
    try {
      const uri = new URL(redirectUri);
      console.log('Redirect URI is valid URL:', uri.href);
    } catch (e) {
      console.error('Invalid redirect URI format:', redirectUri);
    }

    const fullUrl = `${authDomain}/v2/login/authorization/dialog?response_type=code&client_id=${this.apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&state=upstox_auth&scope=${encodeURIComponent(scope)}`;
    console.log('Generated URL:', fullUrl);
    console.log('=== End Debug ===');

    return fullUrl;
  }

  /**
   * Generate session from authorization code
   */
  async generateSession(authorizationCode: string): Promise<any> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API credentials not set. Call initializeWithCredentials() first.');
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const redirectUri = `${baseUrl}/api/auth/upstox/callback`;

      console.log('=== Upstox Session Generation Debug ===');
      console.log('Environment:', this.isSandbox ? 'SANDBOX' : 'PRODUCTION');
      console.log('Redirect URI:', redirectUri);
      console.log('Client ID:', this.apiKey);
      console.log('Authorization Code:', authorizationCode?.substring(0, 10) + '...');

      // Use direct fetch to avoid the superagent ".end() called twice" error
      const tokenEndpoint = this.isSandbox
        ? 'https://api-sandbox.upstox.com/v2/login/authorization/token'
        : 'https://api.upstox.com/v2/login/authorization/token';

      const requestData = {
        code: authorizationCode,
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };

      console.log('Token endpoint:', tokenEndpoint);
      console.log('Token request data:', {
        ...requestData,
        client_secret: requestData.client_secret?.substring(0, 10) + '...'
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(requestData).toString(),
      });

      const responseData = await response.json();

      console.log('Token response status:', response.status);
      console.log('Token response received:', !!responseData);

      if (!response.ok) {
        console.error('Token exchange failed:', responseData);
        throw new Error(responseData.message || responseData.error || 'Failed to exchange authorization code for token');
      }

      if (responseData && responseData.access_token) {
        this.setAccessToken(responseData.access_token);
        console.log('=== Session generation successful ===');
        return responseData;
      } else {
        console.error('Invalid token response structure:', responseData);
        throw new Error('Invalid response from token endpoint');
      }
    } catch (error: any) {
      console.error('=== Upstox Session Generation Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data || error.response);
      console.error('Full error:', error);
      console.error('=== End Error Debug ===');
      throw error;
    }
  }

  /**
   * Debug function to validate Upstox app configuration
   * Call this to check if sandbox credentials and configuration are correct
   */
  debugAppConfiguration(): any {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/upstox/callback`;

    const debugInfo = {
      environment: this.isSandbox ? 'SANDBOX' : 'PRODUCTION',
      clientInitialized: !!this.client,
      clientBasePath: this.client?.basePath,
      apiKey: this.apiKey,
      apiKeyValid: !!(this.apiKey && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.apiKey)),
      apiKeyLength: this.apiKey?.length,
      apiSecretProvided: !!this.apiSecret,
      redirectUri,
      redirectUriValid: this.isValidUrl(redirectUri),
      scope: this.isSandbox ? 'NSE|BSE' : 'NSE|BSE|NFO|CDS|MCX|BFO',
      loginUrl: this.getLoginURL(),
      recommendations: this.getConfigurationRecommendations()
    };

    console.log('=== Upstox App Configuration Debug ===');
    console.table(debugInfo);
    console.log('=== End Configuration Debug ===');

    return debugInfo;
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get configuration recommendations based on current settings
   */
  private getConfigurationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.apiKey) {
      recommendations.push('API Key is missing');
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.apiKey)) {
      recommendations.push('API Key format appears invalid (should be UUID format)');
    }

    if (!this.apiSecret) {
      recommendations.push('API Secret is missing');
    }

    if (this.isSandbox) {
      recommendations.push('Using SANDBOX environment - ensure your app is configured as a sandbox app in Upstox Developer Portal');
      recommendations.push('Verify that the redirect URI is exactly: http://localhost:3000/api/auth/upstox/callback');
      recommendations.push('Sandbox apps might have limited scope access - using minimal scope NSE|BSE');
    } else {
      recommendations.push('Using PRODUCTION environment - ensure your app is live in Upstox Developer Portal');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (baseUrl === 'http://localhost:3000' && !this.isSandbox) {
      recommendations.push('Production apps typically require HTTPS redirect URIs, not localhost');
    }

    return recommendations;
  }

  /**
   * Revoke access token (logout)
   */
  async revokeAccessToken(): Promise<any> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token to revoke');
      }

      const tokenApi = new UpstoxClient.LoginApi(this.client);
      const apiVersion = '2.0';

      const response = await limiter.schedule(() =>
        tokenApi.logout(apiVersion, this.accessToken)
      );

      this.reset();
      return response;
    } catch (error) {
      console.error('Error revoking Upstox access token:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    const userApi = new UpstoxClient.UserApi(this.client);
    const apiVersion = '2.0';

    return limiter.schedule(() => userApi.getProfile(apiVersion));
  }

  /**
   * Get funds and margins
   */
  async getFunds(): Promise<UpstoxFunds> {
    console.log('Upstox service getFunds called');
    console.log('Has client:', !!this.client);
    console.log('Has access token:', !!this.accessToken);
    console.log('Is sandbox mode:', this.isSandbox);

    if (!this.client) {
      throw new Error('Upstox client not initialized. Call initializeWithCredentials() first.');
    }

    if (!this.accessToken) {
      throw new Error('Access token not set. Call setAccessToken() first.');
    }

    // For sandbox mode, return mock data since many APIs are not available
    if (this.isSandbox) {
      console.log('Returning sandbox mock funds data');
      return {
        equity: {
          used_margin: 2500,
          payin_amount: 0,
          span_margin: 1200,
          adhoc_margin: 0,
          notional_cash: 10000,
          available_margin: 7500,
          exposure_margin: 800,
          option_premium: 0,
          collateral_amount: 0,
          coverage_margin: 0,
          liquidity_before: 0,
          cash_deposit: 0,
          liquid_collateral: 10000,
          stock_collateral: 0,
          unrealized_mtm: 150,
          realized_mtm: 300,
          opening_balance: 10000,
          payin_amount_t1: 0,
          payin_amount_t0: 0,
          additional_leverage_amount: 0,
          utilized_amount: 2500,
          available_credits: 0
        }
      };
    }

    try {
      // For production mode, use direct fetch to avoid superagent issues
      const apiVersion = '2.0';
      const fundEndpoint = this.isSandbox
        ? `https://api-sandbox.upstox.com/v2/user/get-funds-and-margin`
        : `https://api.upstox.com/v2/user/get-funds-and-margin`;

      console.log('Calling Upstox funds API directly via fetch...');

      const response = await fetch(fundEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'Api-Version': apiVersion
        }
      });

      const responseData = await response.json();

      console.log('Upstox funds response status:', response.status);

      if (!response.ok) {
        console.error('Funds API failed:', responseData);

        // Check for time restriction error
        if (response.status === 423 && responseData.errors) {
          const timeError = responseData.errors.find((e: any) => e.errorCode === 'UDAPI100072');
          if (timeError) {
            // Return placeholder data with a flag indicating service hours restriction
            return {
              equity: {
                used_margin: 0,
                payin_amount: 0,
                span_margin: 0,
                adhoc_margin: 0,
                notional_cash: 0,
                available_margin: 0,
                exposure_margin: 0,
                option_premium: 0,
                collateral_amount: 0,
                coverage_margin: 0,
                liquidity_before: 0,
                cash_deposit: 0,
                liquid_collateral: 0,
                stock_collateral: 0,
                unrealized_mtm: 0,
                realized_mtm: 0,
                opening_balance: 0,
                payin_amount_t1: 0,
                payin_amount_t0: 0,
                additional_leverage_amount: 0,
                utilized_amount: 0,
                available_credits: 0
              },
              _serviceHoursError: true,
              _errorMessage: timeError.message
            };
          }
        }

        throw new Error(responseData.message || responseData.error || 'Failed to fetch funds');
      }

      console.log('Upstox getFunds result:', responseData);
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error in Upstox getFunds:', error);
      throw error;
    }
  }

  /**
   * Get positions
   */
  async getPositions(): Promise<UpstoxPosition[]> {
    const portfolioApi = new UpstoxClient.PortfolioApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => portfolioApi.getPositions(apiVersion));
    return response.data;
  }

  /**
   * Get holdings
   */
  async getHoldings(): Promise<UpstoxHolding[]> {
    const portfolioApi = new UpstoxClient.PortfolioApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => portfolioApi.getHoldings(apiVersion));
    return response.data;
  }

  /**
   * Get orders
   */
  async getOrders(): Promise<UpstoxOrder[]> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.getOrderBook(apiVersion));
    return response.data;
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<UpstoxOrder[]> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.getOrderDetails(apiVersion, orderId));
    return response.data;
  }

  /**
   * Get trades
   */
  async getTrades(): Promise<any[]> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.getTradeBook(apiVersion));
    return response.data;
  }

  /**
   * Place an order
   */
  async placeOrder(params: UpstoxOrderParams): Promise<{ order_id: string }> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.placeOrder(apiVersion, params));
    return response.data;
  }

  /**
   * Modify an order
   */
  async modifyOrder(orderId: string, params: Partial<UpstoxOrderParams>): Promise<{ order_id: string }> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.modifyOrder(apiVersion, orderId, params));
    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ order_id: string }> {
    const orderApi = new UpstoxClient.OrderApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => orderApi.cancelOrder(apiVersion, orderId));
    return response.data;
  }

  /**
   * Get quote for instruments
   */
  async getQuote(instruments: string[]): Promise<any> {
    const marketQuoteApi = new UpstoxClient.MarketQuoteApi(this.client);
    const apiVersion = '2.0';
    const instrumentKey = instruments.join(',');

    const response = await limiter.schedule(() => marketQuoteApi.getFullMarketQuote(apiVersion, instrumentKey));
    return response.data;
  }

  /**
   * Get LTP for instruments
   */
  async getLTP(instruments: string[]): Promise<any> {
    const marketQuoteApi = new UpstoxClient.MarketQuoteApi(this.client);
    const apiVersion = '2.0';
    const instrumentKey = instruments.join(',');

    const response = await limiter.schedule(() => marketQuoteApi.getLtp(apiVersion, instrumentKey));
    return response.data;
  }

  /**
   * Get OHLC for instruments
   */
  async getOHLC(instruments: string[]): Promise<any> {
    const marketQuoteApi = new UpstoxClient.MarketQuoteApi(this.client);
    const apiVersion = '2.0';
    const instrumentKey = instruments.join(',');

    const response = await limiter.schedule(() => marketQuoteApi.getMarketQuoteOHLC(apiVersion, instrumentKey));
    return response.data;
  }

  /**
   * Get historical data
   */
  async getHistoricalData(
    instrumentKey: string,
    interval: string,
    toDate: string,
    fromDate?: string
  ): Promise<any> {
    const historyApi = new UpstoxClient.HistoryApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() =>
      historyApi.getHistoricalCandleData1(apiVersion, instrumentKey, interval, toDate, fromDate)
    );
    return response.data;
  }

  /**
   * Convert position
   */
  async convertPosition(params: {
    instrument_token: string;
    new_product: string;
    old_product: string;
    transaction_type: 'BUY' | 'SELL';
    quantity: number;
  }): Promise<boolean> {
    const portfolioApi = new UpstoxClient.PortfolioApi(this.client);
    const apiVersion = '2.0';

    const response = await limiter.schedule(() => portfolioApi.convertPosition(apiVersion, params));
    return response.data;
  }
}

// Export singleton instance
const upstoxService = UpstoxService.getInstance();
export default upstoxService;

// Export for backward compatibility
export const {
  getProfile,
  getFunds,
  getPositions,
  getHoldings,
  getOrders,
  getTrades,
  getQuote,
  getLTP,
  getOHLC,
  getHistoricalData,
  placeOrder,
  modifyOrder,
  cancelOrder,
  checkAuth,
} = {
  getProfile: () => upstoxService.getProfile(),
  getFunds: () => upstoxService.getFunds(),
  getPositions: () => upstoxService.getPositions(),
  getHoldings: () => upstoxService.getHoldings(),
  getOrders: () => upstoxService.getOrders(),
  getTrades: () => upstoxService.getTrades(),
  getQuote: (instruments: string[]) => upstoxService.getQuote(instruments),
  getLTP: (instruments: string[]) => upstoxService.getLTP(instruments),
  getOHLC: (instruments: string[]) => upstoxService.getOHLC(instruments),
  getHistoricalData: (
    instrumentKey: string,
    interval: string,
    toDate: string,
    fromDate?: string
  ) => upstoxService.getHistoricalData(instrumentKey, interval, toDate, fromDate),
  placeOrder: (params: any) => upstoxService.placeOrder(params),
  modifyOrder: (orderId: string, params: any) => upstoxService.modifyOrder(orderId, params),
  cancelOrder: (orderId: string) => upstoxService.cancelOrder(orderId),
  checkAuth: () => upstoxService.isLoggedIn(),
};

// Export types
export type { UpstoxService };