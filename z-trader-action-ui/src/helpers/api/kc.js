import axios from "axios";

const endpoint = 'http://localhost:3000'

export const getProfile = () => {
  let data = axios.get(`${endpoint}/kc/get-profile`)
  return data;
};

export const getMargins = () => {
  let data = axios.get(`${endpoint}/kc/get-margins`)
  return data;
};

export const getOHLC = (instruments) => {
  let data = axios.post(`${endpoint}/kc/get-ohlc`, instruments)
  return data;
};

export const getLTP = (instruments) => {
  let data = axios.post(`${endpoint}/kc/get-ltp`, instruments)
  return data;
};

export const getQuotes = (instruments) => {
  let data = axios.post(`${endpoint}/kc/get-quotes`, instruments)
  return data;
};

export const getPositions = () => {
  let data = axios.get(`${endpoint}/kc/get-positions`)
  return data;
};

export const getHoldings = () => {
  let data = axios.get(`${endpoint}/kc/get-holdings`)
  return data;
};

export const getOrders = () => {
  let data = axios.get(`${endpoint}/kc/get-orders`)
  return data;
};

export const getTrades = () => {
  let data = axios.get(`${endpoint}/kc/get-trades`)
  return data;
};

export const getHistoricalData = async (payload, index, chartData, callback) => {
  axios.post("http://localhost:3000/kc/get-historical-data", payload)
    .then((res) => {
      let data = []
      let _data = res.data;
      if (typeof _data !== "string") {
        for (let it in _data) {
          let tmp = {};
          tmp.date = new Date(_data[it]["date"]);
          tmp.open = _data[it]["open"];
          tmp.high = _data[it]["high"];
          tmp.low = _data[it]["low"];
          tmp.close = _data[it]["close"];
          tmp.volume = _data[it]["volume"];
          data.push(tmp);
        }
      } else {
        data = [];
      }
      chartData[index] = data;
      callback(false, chartData);
    })
    .catch(() => {
      callback(true);
    })
}