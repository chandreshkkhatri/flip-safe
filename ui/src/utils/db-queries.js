import axios from "axios";

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

export const getListOfMW = async () => {
  let listOfMW = [];
  await axios.get("http://localhost:3000/db/get-list-of-mw")
    .then(async res => {
      for (let i in res.data) {
        let appInfo = res.data[i].appInfo;
        for (let j in appInfo) {
          if (appInfo[j].name === "zdashboard" || appInfo[j].name === "flip-secure") {
            listOfMW.push({
              name: res.data[i].name,
              status: appInfo[j].status
            });
          }
        }
      }
    })
    .catch(err => console.log(err));
  return listOfMW;
};