export const returnTimeDivider = date => {
  let timeDivider = 0;
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const timeMode = (msLocal / 1000) % 86400;
  if (timeMode < 32400) {
    timeDivider = 0;
  } else {
    if (timeMode > 55800) {
      timeDivider = 100;
    } else {
      timeDivider = Math.floor((timeMode - 32400) / 234);
    }
  }
  return timeDivider;
};
export const prepareMarketData = (simulationData, time) => {
  let marketData                                                            // assuming ascending order of data, that might not be the case all the time
  // console.log("preparing", simulationData);
  let data = [];
  for (let jt in simulationData) {
    let index = 0;
    let iterator = 0;
    let simulatorTime = time.getTime();
    let instrument_token = simulationData[jt]["instrument_token"];
    let status = simulationData[jt]['status']
    let spike3min
    let spike10min
    let last_price
    let candleStickData = [];
    for (let kt in simulationData[jt]["data"]) {
      let dataTime = new Date(simulationData[jt]["data"][kt]["date"]).getTime();
      if (dataTime < simulatorTime) {
        //&& dataTime > indexTime
        index = iterator;
      }
      candleStickData.push(simulationData[jt]["data"][kt]);
      iterator++;
    }
    let threeMinArray = [];
    let tenMinArray = [];
    let volume = 0
    let fluctuation, price_zone, change
    try {
      if (index > 2) {
        threeMinArray = candleStickData.slice(index - 3, index);
      } else {
        threeMinArray = candleStickData.slice(0, index);
      }
      if (index > 9) {
        tenMinArray = candleStickData.slice(index - 10, index);
      } else {
        tenMinArray = candleStickData.slice(0, index);
      }
      if (threeMinArray.length !== 0) {
        let threeMinMax = Math.max(...threeMinArray.map(d => d.high));
        let threeMinMin = Math.min(...threeMinArray.map(d => d.low));
        spike3min = Math.floor(((threeMinMax - threeMinMin) / (threeMinMax + threeMinMin)) * 10000) / 100;
      }
      if (tenMinArray.length !== 0) {
        let tenMinMax = Math.max(...tenMinArray.map(d => d.high));
        let tenMinMin = Math.min(...tenMinArray.map(d => d.low));
        spike10min = Math.floor(((tenMinMax - tenMinMin) / (tenMinMax + tenMinMin)) * 10000) / 100;
      }
      last_price = candleStickData[index]['close']
      let volume_qty = 0, high = 0, low = Infinity
      let open = simulationData[jt]['data'][0]['open']
      for (let kt = 0; kt < index + 1; ++kt) {
        let ohlc_tmp = simulationData[jt]['data'][kt]
        volume_qty += ohlc_tmp['volume']
        if (ohlc_tmp['high'] > high) { high = ohlc_tmp['high'] }
        if (ohlc_tmp['low'] < low) { low = ohlc_tmp['low'] }
      }
      volume = Math.floor((volume_qty * last_price / 100000)) / 100
      fluctuation = (Math.floor(((high - low) * 2 / (high + low)) * 10000)) / 100
      price_zone = Math.floor(((last_price - low) / (high - low)) * 10000) / 100
      change = Math.floor(((last_price - open) / open) * 10000) / 100         //better definition would be to take last session's closing price but that's slightly tricky
    }
    catch (e) {
      console.log(e)
    }
    data.push({ instrument_token, status, spike10min, spike3min, last_price, volume, fluctuation, price_zone, change })
  }
  marketData = data;
  return marketData;
};
export const toKiteDateFormat = date => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal.replace("T", " ");
};

export const getWeekDay = day => {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
  }
};
