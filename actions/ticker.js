const KiteTicker = require("kiteconnect").KiteTicker;

let initializeTicker = (api_key, access_token) => {
    ticker = new KiteTicker({ api_key, access_token });
    ticker.autoReconnect(true, 10, 5)
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);
    ticker.on("disconnect", disconnect);
    ticker.on("reconnecting", (reconnect_interval, reconnections) => {
      console.log("Reconnecting: attempt - ", reconnections, " interval - ", reconnect_interval);
    });
    isInitialized = true
  }
  let onTicks = (ticks) => {
    // console.log(ticks.length)
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
  };
  let disconnect = () => {
    console.log('ticker disconnected')
  }
  let subscribe = async (id = 'ticker2') => {
    console.log('subscribe')
    let response
    let _items = await mwdb.getMWData(id);
    let items = [];
    for (let it in _items) {
      items.push(Number(_items[it]["instrument_token"]));
    }
    // console.log(items)
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
    response = { status: true, message: `ticker subscribed to ${items.length} instruments` }
    return response
  };
  let startStoringTicks = async () => {
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
  let clearCache = () => {
    storage.removeItem('tickCache')
    storage.setItem('tickCache', [])
    console.log('cleared')
  }
  