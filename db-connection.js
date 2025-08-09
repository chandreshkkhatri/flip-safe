var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/zdb', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connected to database');
});

module.exports = db;
