const alerts = require('../models/alerts');

let alertsQueue = [];

alerts
  .getAlerts('pending')
  .then(docs => {
    alertsQueue = docs;
  })
  .catch(err => console.log(err, 'error fetching alerts from db'));

let getAlerts = async query => {
  ///query: pending, triggered, all
  let response;
  await alerts
    .getAlerts(query)
    .then(docs => {
      response = { alerts: docs, status: 'success' };
    })
    .catch(err => {
      console.log(err);
      response = { status: 'error' };
    }); //return something
  return response;
};

let createAlert = (tradingsymbol, trigger_price, trigger_type) => {
  alerts.createAlert(tradingsymbol, trigger_price, trigger_type);
};

let updateAlertStatus = (alert_id, updated_status) => {
  alerts.updateAlertStatus(alert_id, updated_status);
};

let updateAlert = (alert_id, trigger_price) => {
  alerts.updateAlert(alert_id, trigger_price);
};

let scanAlertQueue = ticks => {
  for (let it in alertsQueue) {
    for (let jt in ticks) {
      if (alertsQueue[it].tradingsymbol === ticks[jt].tradingsymbol) {
        console.log('match');
        ///trigger required alerts
        if (false) {
          triggerAlert(alertsQueue[it]._id);
          updateAlertStatus(alertsQueue[it]._id, 'triggered');
        }
      }
    }
  }
};

let triggerAlert = alert_id => {
  ///to be implemented
};

module.exports = { getAlerts, createAlert, scanAlertQueue, updateAlertStatus, updateAlert };
