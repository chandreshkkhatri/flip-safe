import axios from "axios";
const base_url = 'http://localhost:3000/kc'
export const getQuotes = async instruments => {
  let data;
  await axios.post(`${base_url}/get-quotes`, { instruments })
    .then(res => {
      data = res.data;
    })
    .catch(err => (data = "error"));
  return data;
};
export const getChartData = async (payload) => {
  return axios.post(`${base_url}/get-historical-data`, payload)
}
export const requestSimulationInstrumentData = (instrument_token, date, interval) => {
  return axios.get(`${base_url}/request-simulation-data?instrument_token=${instrument_token}&date=${date}&interval=${interval}`);
};
export const flushSimulationDataFromServer = () => {
  return axios.get(`${base_url}/flush-simulation-data`)
}