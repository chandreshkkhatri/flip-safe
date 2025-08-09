const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// Enable CORS for all origins in development
app.use(
  cors({
    origin: ['http://localhost:3098', 'http://localhost:3000'],
    credentials: true,
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());

// Serve static files for production builds
app.use('/ui', express.static(path.join(__dirname, 'action-ui/build')));

// Initialize database connection
require('./db-connection');

// Import route handlers
const alertsRouter = require('./routes/alerts');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const dbRouter = require('./routes/db');
const kcRouter = require('./routes/kc');
const tickerRouter = require('./routes/ticker');

// Register API routes
app.use('/alerts', alertsRouter);
app.use('/orders', ordersRouter);
app.use('/auth', authRouter);
app.use('/db', dbRouter);
app.use('/ticker', tickerRouter);
app.use('/kc', kcRouter);

// 404 error handler - must be after all other routes
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
