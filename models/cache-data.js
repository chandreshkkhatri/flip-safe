var mongoose = require('mongoose');
const kcHandler = require('../handlers/kc');

var candleStickDataSchema = new mongoose.Schema({
  instrument_token: String,
  interval: String,
  candleStickData: Array,
});
var CandleStickData = mongoose.model('CandleStickData', candleStickDataSchema);

var cacheRequestSchema = new mongoose.Schema({
  instrument_token: String,
  interval: String,
  from_date: String,
  to_date: String,
});
var CacheRequest = mongoose.model('CacheRequest', cacheRequestSchema);

let cacheData = async (instrument_token, interval, data) => {
  CandleStickData.findOne({ $and: [{ instrument_token }, { interval }] })
    .then(doc => {
      let inserted = 0;
      let exists = 0;
      if (doc) {
        let candleStickData = doc.candleStickData;
        for (let it in data) {
          let timeStamp = new Date(data[it]['date']);
          let date = timeStamp.toLocaleDateString();
          if (date === 'Invalid Date') {
            console.log(date);
          }
          let flag = true;
          for (let jt in candleStickData) {
            if (candleStickData[jt]['date'] === date) {
              flag = false;
              let notPresent = true;
              for (let kt in candleStickData[jt]['candles']) {
                let candleStickTimeStamp = String(candleStickData[jt]['candles'][kt]['date']);
                let dataTimeStamp = String(data[it]['date']);
                if (candleStickTimeStamp === dataTimeStamp) {
                  exists++;
                  notPresent = false;
                  // under the assumption that single timestamp can have only one entry, it might not be true, keep a check
                  // we can run a check to find number of inconsistensies once we cache all data
                }
              }
              if (notPresent) {
                candleStickData[jt]['candles'].push(data[it]);
                inserted++;
              }
            }
          }
          if (flag) {
            candleStickData.push({ date, candles: [data[it]] });
            inserted++;
          }
        }
        doc.markModified('candleStickData');
        doc.save(err => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        let candleStickData = [];
        for (let it in data) {
          let date = new Date(data[it]['date']).toLocaleDateString();
          let flag = true;
          for (let jt in candleStickData) {
            if (candleStickData[jt]['date'] === date) {
              flag = false;
              let notPresent = true;
              for (let kt in candleStickData[jt]['candles']) {
                let candleStickTimeStamp = String(candleStickData[jt]['candles'][kt]['date']);
                let dataTimeStamp = String(data[it]['date']);
                if (candleStickTimeStamp === dataTimeStamp) {
                  notPresent = false;
                  exists++;
                }
              }
              if (notPresent) {
                candleStickData[jt]['candles'].push(data[it]);
                inserted++;
              }
            }
          }
          if (flag) {
            candleStickData.push({ date, candles: [data[it]] });
            inserted++;
          }
        }
        if (candleStickData.length > 0) {
          let candle = new CandleStickData({ instrument_token, interval, candleStickData });
          candle.save(err => {
            if (err) {
              console.log(err, 'error saving candlestick data');
            }
          });
        }
      }
      console.log(
        `${inserted} of ${data.length} candles inserted for ${instrument_token}, ${exists} candles already present, ${++console_counter}`
      );
    })
    .catch(err => {
      console.log('error querying db');
    });
};
let sendToPendingCacheStack = (instrument_token, interval, from_date, to_date) => {
  new CacheRequest({ instrument_token, interval, from_date, to_date }).save(err => {
    if (err) {
      console.log('Error saving cache request');
    }
  });
};

let clearCacheStack = () => {
  CacheRequest.find()
    .then(async docs => {
      let requestArray = [];
      let t = 0;
      let l = docs.length;
      console.log(`${l} requests in stack, trying to clear`);
      for (let it in docs) {
        requestArray.push(docs[it]);
        await setTimeout(() => {}, 400);
        let { instrument_token, interval, from_date, to_date } = requestArray[it];
        await kcHandler
          .getHistoricalData(instrument_token, interval, from_date, to_date)
          .then(async response => {
            data = response;
            await cacheData(instrument_token, interval, data);
            docs[it].remove();
          })
          .catch(err => {
            console.log('error clearing request', instrument_token);
            console.log(err);
          });
      }
    })
    .catch(err => console.log(err));
};

let flushCacheStack = () => {
  CacheRequest.deleteMany({}, err => {
    console.log(`requests in stack flushed`);
    if (err) {
      console.log(err, 'error flushing cache stack');
    }
  });
};

let clearConsoleCounter = () => {
  console_counter = 0;
};

module.exports = {
  cacheData,
  sendToPendingCacheStack,
  clearCacheStack,
  flushCacheStack,
  clearConsoleCounter,
};
