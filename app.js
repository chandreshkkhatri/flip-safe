var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var app = express();

// Enable CORS for all origins in development
app.use(cors({
  origin: ['http://localhost:3098', 'http://localhost:3099', 'http://localhost:3000'],
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());

// Serve static files for production builds
app.use('/ui', express.static(path.join(__dirname, 'z-trader-ui/build')));
app.use('/action-ui', express.static(path.join(__dirname, 'z-trader-action-ui/build')));

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
