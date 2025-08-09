import axios from "axios";
import constants from "../constants";

const { baseURL } = constants.config;

export const getQuotes = async (instruments) => {
  try {
    const response = await axios.post(`${baseURL}${constants.routes.kc.getQuotes}`, { instruments });
    return response.data;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
};

export const getChartData = async (instrument_token, from_date, to_date, interval) => {
  try {
    const payload = { instrument_token, from_date, to_date, interval };
    const response = await axios.post(`${baseURL}${constants.routes.kc.getHistoricalData}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return [];
  }
};

export const requestSimulationInstrumentData = async (instrument_token, date, interval) => {
  try {
    const response = await axios.get(`${baseURL}${constants.routes.kc.requestSimulationData}?instrument_token=${instrument_token}&date=${date}&interval=${interval}`);
    return response.data;
  } catch (error) {
    console.error('Error requesting simulation data:', error);
    throw error;
  }
};

export const flushSimulationDataFromServer = async () => {
  try {
    const response = await axios.get(`${baseURL}${constants.routes.kc.flushSimulationData}`);
    return response.data;
  } catch (error) {
    console.error('Error flushing simulation data:', error);
    throw error;
  }
};