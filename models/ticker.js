var mongoose = require('mongoose');

var ticksSchema = new mongoose.Schema({
  instrument_token: String,
  ticks: Array,
});
var Ticks = mongoose.model('Ticks', ticksSchema);

let storeTicks = (payload, timeStamp) => {
  for (let it in payload) {
    let instrument_token = payload[it].instrument_token;
    Ticks.findOne({ instrument_token })
      .then(doc => {
        if (doc === null) {
          let instrument = new Ticks({
            instrument_token,
            ticks: [{ timeStamp, ticks: payload[it] }],
          });
          instrument.save();
        } else {
          let ticks = doc.ticks;
          ticks.push({ timeStamp, ticks: payload[it] });
          doc.ticks = ticks;
          doc.markModified('ticks');
          doc.save(err => {
            if (err) {
              console.log(err, 'error');
            }
          });
        }
      })
      .catch(err => console.log(err));
  }
};

let retrieveTicks = async () => {
  let response;
  await Ticks.find()
    .then(docs => (response = docs))
    .catch(err => console.log(err));
  return response;
};

let clearTicksCache = () => {
  Ticks.deleteMany({}, err => {
    if (err) {
      console.log(err);
    }
  });
};

module.exports = { storeTicks, retrieveTicks, clearTicksCache };
