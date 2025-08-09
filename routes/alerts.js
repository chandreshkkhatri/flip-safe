const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const alerts = require('../handlers/alerts');

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(cors());

router.use(function (req, res, next) {
  next();
});

// define the home page route
router.get('/', (req, res) => {
  res.send('Bonjour!');
});
router.get('/get-alerts', (req, res) => {
  alerts
    .getAlerts('all')
    .then(response => {
      console.log(response);
      res.send(response);
    })
    .catch(err => res.send('error'));
});
router.get('/create-alert', (req, res) => {
  let { tradingsymbol, trigger_price, trigger_type } = req.query;
  alerts.createAlert(tradingsymbol, trigger_price, trigger_type);
  res.send('Bonjour!');
});
router.get('/update-alert', (req, res) => {
  let { alert_id, trigger_price } = req.query;
  alerts.updateAlert(alert_id, trigger_price);
  res.send('Bonjour!');
});
router.get('/cancel-alert', (req, res) => {
  let { alert_id } = req.query;
  alerts.updateAlertStatus(alert_id, 'cancelled');
  res.send('Cancel request recieved');
});
module.exports = router;
