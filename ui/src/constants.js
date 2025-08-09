
const API_ROUTES = {
    auth: {
        checkStatus: '/auth/check-status',
        logout: '/auth/logout'
    },
    kc: {
        getQuotes: '/kc/get-quotes',
        getHistoricalData: '/kc/get-historical-data',
        requestSimulationData: '/kc/request-simulation-data',
        flushSimulationData: '/kc/flush-simulation-data'
    },
    db: {
        getMWData: '/db/get-mw-data',
        getListOfMW: '/db/get-list-of-mw'
    }
};

const API_CONFIG = {
    baseURL: 'http://localhost:3000',
    clientURL: 'http://localhost:3098'
};

export default {
    routes: API_ROUTES,
    config: API_CONFIG
};