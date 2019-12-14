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
const alertsRouter = require('./routes/alerts-router')
const ordersRouter = require('./routes/orders-router')
const authRouter = require('./routes/auth-router')
const dbRouter = require('./routes/db-router')
const kcRouter = require('./routes/kc-router')
const tickerRouter = require('./routes/ticker-router')
app.use('/alerts', alertsRouter)
app.use('/orders', ordersRouter)
app.use('/auth', authRouter)
app.use('/db', dbRouter)
app.use('/ticker', tickerRouter)
app.use('/kc', kcRouter)
app.use(cors())
//////////////!
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
