import axios from "axios";
const endpoint = 'http://localhost:3000';

export const getMWInstruments = async mwName => {
  let response;
  await axios.get(`http://localhost:3000/db/get-mw-data?mwName=${mwName}`)
    .then(res => {
      let data = res.data;
      response = data;
    })
    .catch(err => console.log(err));
  return response;
};

export const getListOfMW = async (callback) => {
  let listOfMW = [];
  await axios.get("http://localhost:3000/db/get-list-of-mw")
    .then(async res => {
      for (let i in res.data) {
        let appInfo = res.data[i].appInfo;
        for (let j in appInfo) {
          if (appInfo[j].name === "ztrader") {
            listOfMW.push({
              name: res.data[i].name,
              status: appInfo[j].status
            });
          }
        }
      }
    })
    .catch(err => console.log(err));
  callback(listOfMW)
};

export const requestSimulationInstrumentData = (instrument_token, date, interval) => {
  return axios.get(`http://localhost:3000/db/request-simulation-data?instrument_token=${instrument_token}&date=${date}&interval=${interval}`);
};

export const queryInstrument = async (query, filterValue) => {
  let instrumentOptions = []
  await axios.get(`http://localhost:3000/db/query-instruments?queryString=${query}&filterString=${filterValue}`)
    .then((res) => {
      this.fetchedInstruments = res.data
      let data = res.data
      for (let it in data) {
        instrumentOptions.push({
          label: `${data[it]['tradingsymbol']} ${data[it]['exchange']}`,
          exchange: data[it]['exchange'],
          key: data[it]['_id']
        })
      }
    })
    .catch((err) => console.log(err))
  return instrumentOptions
}

export const getTickerInfo = async (callback) => {
  await axios.get(`${endpoint}/db/get-ticker-info`)
    .then((res) => {
      let _tickerInfo = res.data
      let tickerInfo = []
      for (let it in _tickerInfo) {
        if (_tickerInfo[it].status === 'success') {
          tickerInfo.push(_tickerInfo[it]['info'])
        } else {
          console.log(`error fetching ticker info ${it}`)
        }
      }
      callback(tickerInfo)
    })
    .catch((err) => console.log(err))
}

export const subscribeToTicker = async (mwName, tickerNo, callback) => {
  await axios.get(`${endpoint}/db/subscribe-to-ticker?mwName=${mwName}&tickerId=ticker${tickerNo}`)
    .then((res) => {
      callback(res.data)
    })
    .catch((err) => console.log(err))
}

export const clearTicker = async (tickerNo, callback) => {
  axios.get(`${endpoint}/db/clear-ticker?tickerId=ticker${tickerNo}`)
    .then((res) => {
      callback(res.data)
    })
    .catch((err) => console.log(err))
}

export const updateMarketWatchInfo = async (listOfUpdates, callback) => {
  await axios.post(`${endpoint}/db/update-mw-info`, listOfUpdates)
    .then((res) => {
      callback()
    })
    .catch(err => {
      console.log(err)
    })
}

export const createNewMarketWatch = async (mwInfo, callback) => {
  await axios.post(`${endpoint}/db/create-new-mw`, { mwInfo })
    .then(() => {
      callback()
    })
    .catch((err) => {
      console.log(err)
    })
}

export const addInstrumentToCollection = (data) => {
  axios.post("http://localhost:3000/db/add-instrument-to-collection", data)
    .then(async res => {
      console.log('added')
    })
    .catch(err => console.log(err));
}

export const deleteInstrument = (mwName, instrument) => {
  axios.get(`http://localhost:3000/db/delete-instrument?mwName=${mwName}&instrument_token=${instrument.instrument_token}`)
    .then(async res => {
      console.log('deleted')
    })
    .catch(err => console.log(err))
}