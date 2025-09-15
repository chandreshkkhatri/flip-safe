import kiteConnectService from './kiteconnect';
import limiter from './limiter';

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
