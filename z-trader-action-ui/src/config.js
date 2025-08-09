const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default {
  API_BASE_URL,
  endpoints: {
    auth: `${API_BASE_URL}/auth`,
    db: `${API_BASE_URL}/db`,
    kc: `${API_BASE_URL}/kc`,
    ticker: `${API_BASE_URL}/ticker`,
    alerts: `${API_BASE_URL}/alerts`,
    orders: `${API_BASE_URL}/orders`
  }
};