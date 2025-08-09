import axios from "axios";
import constants from "../constants";

const { baseURL } = constants.config;

export const getMWInstruments = async (mwName) => {
  try {
    const response = await axios.get(`${baseURL}${constants.routes.db.getMWData}?mwName=${mwName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching MW instruments:', error);
    throw error;
  }
};

export const getListOfMW = async () => {
  try {
    const response = await axios.get(`${baseURL}${constants.routes.db.getListOfMW}`);
    const listOfMW = [];
    
    response.data.forEach((item) => {
      if (item.appInfo) {
        item.appInfo.forEach((app) => {
          if (app.name === "zdashboard" || app.name === "flip-safe") {
            listOfMW.push({
              name: item.name,
              status: app.status
            });
          }
        });
      }
    });
    
    return listOfMW;
  } catch (error) {
    console.error('Error fetching list of MW:', error);
    throw error;
  }
};