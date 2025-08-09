const API_ROUTES = {
  auth: {
    checkStatus: '/api/auth/check-status',
    logout: '/api/auth/logout',
    login: '/api/auth/login',
    setLoginInfo: '/api/auth/set-login-info'
  },
  kc: {
    getQuotes: '/api/kc/get-quotes',
    getHistoricalData: '/api/kc/get-historical-data',
    requestSimulationData: '/api/kc/request-simulation-data',
    flushSimulationData: '/api/kc/flush-simulation-data'
  },
  db: {
    getMWData: '/api/db/get-mw-data',
    getListOfMW: '/api/db/get-list-of-mw'
  },
  orders: {
    placeOrder: '/api/orders/place',
    getOrders: '/api/orders',
    getPositions: '/api/orders/positions',
    getHoldings: '/api/orders/holdings'
  },
  alerts: {
    getAlerts: '/api/alerts',
    createAlert: '/api/alerts/create',
    deleteAlert: '/api/alerts/delete'
  },
  ticker: {
    subscribe: '/api/ticker/subscribe',
    unsubscribe: '/api/ticker/unsubscribe'
  }
} as const;

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  clientURL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'
} as const;

const PAGE_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  TERMINAL: '/terminal',
  ORDERS: '/orders',
  POSITIONS: '/positions',
  HOLDINGS: '/holdings',
  ALERTS: '/alerts',
  SIMULATOR: '/simulator'
} as const;

export default {
  routes: API_ROUTES,
  config: API_CONFIG,
  pages: PAGE_ROUTES
};

export { API_ROUTES, API_CONFIG, PAGE_ROUTES };