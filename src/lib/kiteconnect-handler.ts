import kiteConnectService from './kiteconnect';
import limiter from './limiter';

export const getProfile = async () => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getProfile());
};

export const getMargins = async (segment?: string) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getMargins(segment));
};

export const getOHLC = async (instruments: string[]) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getOHLC(instruments));
};

export const getLTP = async (instruments: string[]) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getLTP(instruments));
};

export const getQuote = async (instruments: string[]) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getQuote(instruments));
};

export const getPositions = async () => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getPositions());
};

export const getHoldings = async () => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getHoldings());
};

export const getOrders = async () => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getOrders());
};

export const getTrades = async () => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getTrades());
};

export const getInstruments = async (exchange?: string) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.getInstruments(exchange));
};

export const getHistoricalData = async (
  instrument_token: string,
  interval: string,
  from_date: string,
  to_date: string,
  continuous: number = 0
) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() =>
    kc.getHistoricalData(instrument_token, interval, from_date, to_date, continuous)
  );
};

export const placeOrder = async (orderParams: any) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.placeOrder(orderParams));
};

export const modifyOrder = async (orderId: string, orderParams: any) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.modifyOrder(orderId, orderParams));
};

export const cancelOrder = async (orderId: string) => {
  const kc = kiteConnectService.getKiteConnect();
  return limiter.schedule(() => kc.cancelOrder(orderId));
};

// Helper function to check if user is authenticated
export const checkAuth = () => {
  return kiteConnectService.isLoggedIn();
};
