const kc = require('../../session').kc

const Bottleneck = require("bottleneck/es5");
const limiter = new Bottleneck({
    minTime: 333
});

let getProfile = () => { return limiter.schedule(kc.getProfile) }
let getMargin = () => { return limiter.schedule(kc.getMargins) }
let getOHLC = (instruments) => { return limiter.schedule(kc.getOHLC, instruments) }
let getLTP = (instruments) => { return limiter.schedule(kc.getLTP, instruments) }
let getQuote = (instruments) => { return limiter.schedule(kc.getQuote, instruments) }
let getPositions = () => { return limiter.schedule(kc.getPositions) }
let getHoldings = () => { return limiter.schedule(kc.getHoldings) }
let getOrders = () => { return limiter.schedule(kc.getOrders) }
let getTrades = () => { return limiter.schedule(kc.getTrades) }
let getHistoricalData = (instrument_token, interval, from_date, to_date, continuos = 0) => {
    return limiter.schedule(kc.getHistoricalData, instrument_token, interval, from_date, to_date, continuos)
}

module.exports = {
    getProfile, getMargin, getOHLC, getLTP, getQuote, getHoldings, getPositions, getOrders, getTrades, getHistoricalData
}