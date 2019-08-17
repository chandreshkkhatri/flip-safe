const kc = require('../session').kc
const limiter = require('../utils/utils').limiter
const alerts = require('../db/alerts')

let alertsQueue = []

alerts.getAlerts('pending')
    .then((docs) => {
        alertsQueue = docs
    })
    .catch((err) => console.log(err, 'error fetching alerts from db'))

let getAlerts = (query) => {        ///query: pending, triggered, all
    alerts.getAlerts(query)
        .then(docs => {
            return docs
        })
        .catch(err => console.log(err))         //return something

}

let createAlert = (tradingsymbol, trigger_price, trigger_type) => {
    alerts.createAlert(tradingsymbol, trigger_price, trigger_type)
}

let updateAlertStatus = (alert_id) => { alerts.updateAlertStatus(alert_id) }

let scanAlertQueue = (ticks) => {
    for (let it in alertsQueue) {
        for (let jt in ticks) {
            if (alertsQueue[it].tradingsymbol === ticks[jt].tradingsymbol) {
                console.log('match')
                ///trigger required alerts
                if (false) {
                    updateAlertStatus(alertsQueue[it]._id)
                }

            }
        }
    }
}

module.exports = { getAlerts, createAlert, scanAlertQueue }