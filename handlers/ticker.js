const KiteTicker = require("kiteconnect").KiteTicker;
// const orderHandler = require('../handlers/orders')
// const alerts = require('./alerts')
const storage = require('node-persist');
const mwdb = require('../models/marketwatch')

storage.init({
  dir: './node-persist',
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: 'utf8',
})

let storingTicks = false
let tickStore = []
let tickCache = []
let ticker
const session = require('../session')
const cred = require('../app-cred.json')

let isInitialized = false

let initializeTicker = () => {
  let api_key = cred.api_key
  let access_token = session.kc.access_token
  if (session.active_ticker_access_token !== access_token) {
    console.log('initializing ticker')
    ticker = new KiteTicker({ api_key, access_token });
    ticker.autoReconnect(true, 10, 5)
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);
    ticker.on("disconnect", disconnected);
    ticker.on("reconnecting", (reconnect_interval, reconnections) => {
      console.log("Reconnecting: attempt - ", reconnections, " interval - ", reconnect_interval);
    });
    isInitialized = true
    session.active_ticker_access_token = access_token
  }
}

let connected = async () => {
  let status = false
  if (isInitialized) {
    status = await ticker.connected()
  }
  return status
}
let connect = async () => {
  let isConnected = await connected()
  if (!isConnected) {
    clearCache()
    ticker.connect()
  }
}
let onTicks = (ticks) => {
  for (let it in ticks) {
    let flag = true
    for (let jt in tickStore) {
      if (ticks[it].instrument_token === tickStore[jt].instrument_token) {
        tickStore[jt] = ticks[it]
        flag = false
      }
    }
    if (flag) {
      tickStore.push(ticks[it])
    }
  }
  // orderHandler.scanOrderTriggerQueue(ticks)
  // orderHandler.scanExitTriggerQueue(ticks)
  // alerts.scanAlertQueue(ticks)
};
let disconnected = () => {
  console.log('ticker disconnected')
}
let disconnect = () => {
  ticker.disconnect()
}
let subscribe = async (id = 'ticker2') => {
  console.log('subscribed to ticker')
  let response
  let _items = await mwdb.getMWData(id);
  let items = [];
  for (let it in _items) {
    items.push(Number(_items[it]["instrument_token"]));
  }
  ticker.subscribe(items);
  ticker.setMode(ticker.modeFull, items);
  response = { status: true, message: `ticker subscribed to ${items.length} instruments` }
  return response
};
let startStoringTicks = async () => {
  // console.log('start storing ticks')
  if (!storingTicks) {
    storingTicks = true
    tmp = await storage.getItem('tickCache')
    if (tmp) {
      tickCache = tmp
    }
    setInterval(storeTicks, 900)
  }
}
let storeTicks = () => {
  let timeStamp = new Date()
  let index600 = Math.floor(timeStamp.getTime() / 1000) % 600
  let index180 = Math.floor(timeStamp.getTime() / 1000) % 180
  for (let it in tickStore) {
    let matched = false
    for (let jt in tickCache) {
      if (tickCache[jt]['instrument_token'] === tickStore[it]['instrument_token']) {
        matched = true
        for (let kt in tickStore[jt]) {
          tickCache[jt][kt] = tickStore[it][kt]
        }
        if (tickCache[jt].last_10min_price) {
          tickCache[jt].last_10min_price[index600] = tickStore[it]['last_price']
        }
        // else {
        //   tickCache[jt].last_10min_price = []
        //   tickCache[jt].last_10min_price[index600] = tickStore[it]['last_price']
        // }
        if (tickCache[jt].last_3min_price) {
          tickCache[jt].last_3min_price[index180] = tickCache[it]['last_price']
        }
        // else {
        //   tickCache[jt].last_3min_price = []
        //   tickCache[jt].last_3min_price[index180] = tickCache[it]['last_price']
        // }
      }
    }
    if (!matched) {
      let tmp = tickStore[it]
      tmp.last_10min_price = []
      tmp.last_10min_price[index600] = tickStore[it]['last_price']
      tmp.last_3min_price = []
      tmp.last_3min_price[index180] = tmp['last_price']
      tickCache.push(tmp)
      // console.log('not matched')
    }
  }
  storage.setItem('tickCache', tickCache)
}
let getTicks = () => {
  return tickCache
}
let clearCache = () => {
  storage.removeItem('tickCache')
  storage.setItem('tickCache', [])
  console.log('cleared')
}


module.exports = {
  initializeTicker, startStoringTicks, clearCache, tickStore, getTicks, connected, connect, disconnect
}