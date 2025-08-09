import { max, min } from './common';

export const processTicks = (ticks) => {
    let marketData = []
    for (let it in ticks) {
        if (ticks[it]['tradable'] === true) {
            if (ticks[it].volume > 0) {
                let max_price_10min = max(ticks[it].last_10min_price)
                let min_price_10min = min(ticks[it].last_10min_price)
                let max_price_3min = max(ticks[it].last_3min_price)
                let min_price_3min = min(ticks[it].last_3min_price)
                ticks[it].fluctuation = Math.floor(((ticks[it].ohlc.high - ticks[it].ohlc.low) / ticks[it].ohlc.open) * 10000) / 100
                ticks[it].price_zone = Math.floor(((ticks[it].last_price - ticks[it].ohlc.low) / (ticks[it].ohlc.high - ticks[it].ohlc.low)) * 100)
                ticks[it].change = Math.floor(ticks[it]['change'] * 100) / 100
                ticks[it].volume = Math.floor((Number(ticks[it]["volume"]) * Number(ticks[it]["last_price"])) / 100000);
                ticks[it].spike10min = Math.floor(((max_price_10min - min_price_10min) / ticks[it].last_price) * 10000) / 100
                ticks[it].spike3min = Math.floor(((max_price_3min - min_price_3min) / ticks[it].last_price) * 10000) / 100
                marketData.push(ticks[it])
            } else {
                ticks[it].fluctuation = 'NA'
                ticks[it].price_zone = 'NA'
                ticks[it].change = 'NA'
                ticks[it].volume = 'NA'
                marketData.push(ticks[it])
            }
        } else {
            let max_price_10min = max(ticks[it].last_10min_price)
            let min_price_10min = min(ticks[it].last_10min_price)
            let max_price_3min = max(ticks[it].last_3min_price)
            let min_price_3min = min(ticks[it].last_3min_price)
            ticks[it].fluctuation = Math.floor(((ticks[it].ohlc.high - ticks[it].ohlc.low) / ticks[it].ohlc.open) * 10000) / 100
            ticks[it].price_zone = Math.floor(((ticks[it].last_price - ticks[it].ohlc.low) / (ticks[it].ohlc.high - ticks[it].ohlc.low)) * 100)
            ticks[it].change = Math.floor(ticks[it]['change'] * 100) / 100
            ticks[it].volume = 'NA'
            ticks[it].spike10min = Math.floor(((max_price_10min - min_price_10min) / ticks[it].last_price) * 10000) / 100
            ticks[it].spike3min = Math.floor(((max_price_3min - min_price_3min) / ticks[it].last_price) * 10000) / 100
            marketData.push(ticks[it])
        }
    }
    return marketData
}