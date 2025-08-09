var mongoose = require('mongoose');

var SimulationDataSchema = new mongoose.Schema({
  instrument_token: String,
  interval: String,
  date: String,
  candleStickData: Array,
});
var SimulationData = mongoose.model('SimulationData', SimulationDataSchema);

let storeSimulationData = (instrument_token, interval, date, candleStickData) => {
  new SimulationData({ instrument_token, interval, date, candleStickData }).save(err => {
    if (err) {
      console.log('error saving simulation data');
    }
  });
};
let getSimulationData = async (instrument_token, interval, date) => {
  let response;
  await SimulationData.findOne({ instrument_token, interval, date })
    .then(doc => {
      response = { status: true, doc: doc };
    })
    .catch(err => {
      response = { status: false };
    });
  return response;
};
let flushSimulationData = () => {
  SimulationData.deleteMany({}, err => {
    if (err) {
      console.log(err);
    }
  });
};

module.exports = { storeSimulationData, getSimulationData, flushSimulationData };
