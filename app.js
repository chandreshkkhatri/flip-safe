var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());

require('./db-connection')
const alertsRouter = require('./routes/alerts')
const ordersRouter = require('./routes/orders')
const authRouter = require('./routes/auth')
const dbRouter = require('./routes/db')
const kcRouter = require('./routes/kc')
const tickerRouter = require('./routes/ticker')
app.use('/alerts', alertsRouter)
app.use('/orders', ordersRouter)
app.use('/auth', authRouter)
app.use('/db', dbRouter)
app.use('/ticker', tickerRouter)
app.use('/kc', kcRouter)
app.use(cors())

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
