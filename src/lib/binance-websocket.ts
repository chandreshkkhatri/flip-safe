interface PriceUpdate {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  high: string;
  low: string;
}

interface WebSocketManager {
  connect: (symbols: string[], onMessage: (data: PriceUpdate) => void) => void;
  disconnect: () => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
}

export class BinanceWebSocket implements WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private onMessageCallback: ((data: PriceUpdate) => void) | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  connect(symbols: string[], onMessage: (data: PriceUpdate) => void): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.onMessageCallback = onMessage;
    this.subscribedSymbols = new Set(symbols.map(s => s.toLowerCase()));
    this.isConnecting = true;

    try {
      // Binance WebSocket URL for 24hr ticker data
      const wsUrl = 'wss://fstream.binance.com/ws/!ticker@arr';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Binance WebSocket connected');
        this.isConnecting = false;
        
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle array of tickers
          if (Array.isArray(data)) {
            data.forEach((ticker) => {
              const symbol = ticker.s; // Symbol
              if (this.subscribedSymbols.has(symbol.toLowerCase())) {
                const priceUpdate: PriceUpdate = {
                  symbol: symbol,
                  price: ticker.c, // Close price
                  priceChangePercent: ticker.P, // Price change percent
                  volume: ticker.v, // Volume
                  high: ticker.h, // High price
                  low: ticker.l, // Low price
                };
                this.onMessageCallback?.(priceUpdate);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Binance WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.reconnectTimer = null;
      
      if (this.onMessageCallback && this.subscribedSymbols.size > 0) {
        this.connect(Array.from(this.subscribedSymbols), this.onMessageCallback);
      }
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribedSymbols.clear();
    this.onMessageCallback = null;
    this.isConnecting = false;
  }

  addSymbol(symbol: string): void {
    this.subscribedSymbols.add(symbol.toLowerCase());
    
    // If WebSocket is connected, we don't need to do anything special
    // as we're already subscribed to all tickers
  }

  removeSymbol(symbol: string): void {
    this.subscribedSymbols.delete(symbol.toLowerCase());
  }
}

// Singleton instance
export const binanceWebSocket = new BinanceWebSocket();