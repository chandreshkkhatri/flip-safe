const { KiteConnect } = require('kiteconnect');

// Load credentials from environment variables
const API_KEY = process.env.KITE_API_KEY || '';
const API_SECRET = process.env.KITE_API_SECRET || '';

if (!API_KEY || !API_SECRET) {
  console.warn(
    'Kite API credentials not found. Please set KITE_API_KEY and KITE_API_SECRET environment variables.'
  );
}

interface KiteConnectInstance {
  access_token?: string;
  setAccessToken(token: string): void;
  generateSession(requestToken: string, apiSecret: string): Promise<any>;
  invalidateAccessToken(): Promise<any>;
  setSessionExpiryHook(callback: () => void): void;
  getQuote(instruments: string[]): Promise<any>;
  [key: string]: any;
}

class KiteConnectService {
  private kc: KiteConnectInstance;
  public active_ticker_access_token: string | null = null;

  constructor() {
    this.kc = new KiteConnect({ api_key: API_KEY });
  }

  getKiteConnect(): KiteConnectInstance {
    return this.kc;
  }

  reset(): void {
    this.kc = new KiteConnect({ api_key: API_KEY });
    this.active_ticker_access_token = null;
  }

  setAccessToken(access_token: string): void {
    this.kc.setAccessToken(access_token);
    this.active_ticker_access_token = access_token;
  }

  getAccessToken(): string | null {
    return this.kc.access_token || null;
  }

  isLoggedIn(): boolean {
    return !!this.kc.access_token;
  }

  async generateSession(request_token: string): Promise<any> {
    try {
      const response = await this.kc.generateSession(request_token, API_SECRET);
      this.setAccessToken(response.access_token);
      return response;
    } catch (error) {
      console.error('Error generating session:', error);
      throw error;
    }
  }

  async invalidateAccessToken(): Promise<any> {
    try {
      const response = await this.kc.invalidateAccessToken();
      this.reset();
      return response;
    } catch (error) {
      console.error('Error invalidating access token:', error);
      throw error;
    }
  }

  setSessionExpiryHook(callback: () => void): void {
    this.kc.setSessionExpiryHook(callback);
  }
}

// Singleton instance
const kiteConnectService = new KiteConnectService();

export default kiteConnectService;
export { API_KEY, API_SECRET };
export type { KiteConnectInstance };
