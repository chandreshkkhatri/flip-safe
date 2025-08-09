import axios from "axios";
const endpoint = 'http://localhost:3000'

export const connectTicker = () => {
    return axios.get(`${endpoint}/ticker/connect`);
};
export const disconnectTicker = tickerId => {
    return axios.get(`${endpoint}/ticker/disconnect`);
};
export const checkTickerStatus = () => {
    return axios.get(`${endpoint}/ticker/is-connected`)
}
export const testTicker = () => {
    return axios.get(`${endpoint}/ticker/test`)
}

export const getTicks = async () => {
    let marketData
    await axios.get(`${endpoint}/ticker/get-ticks`)
        .then((res) => {
            marketData = res.data.ticks
        })
    return marketData
}
export const clearCache = () => {
    return axios.get(`${endpoint}/ticker/clear-cache`)
}