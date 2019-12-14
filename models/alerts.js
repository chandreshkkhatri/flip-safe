var mongoose = require('mongoose');

var alertSchema = new mongoose.Schema({ tradingsymbol: String, trigger_price: Number, trigger_type: String, status: String })
var Alert = mongoose.model('Alert', alertSchema)

let getAlerts = (query) => {
    if (query === 'all') {
        return Alert.find()
    } else {
        return Alert.find({ status: query })
    }
}

let createAlert = (tradingsymbol, trigger_price, trigger_type) => {
    let alert = new Alert({ tradingsymbol, trigger_price, trigger_type, status: 'pending' })
    alert.save(err => { if (err) { console.log(err, 'error storing alert') } })
}

let updateAlertStatus = (alert_id, updated_status) => {
    Alert.findOne({ _id: alert_id })
        .then((doc) => {
            console.log(doc)
            doc.status = updated_status
            doc.save((err) => { if (err) { console.log(err, 'error') } })
        })
        .catch(err => console.log(err))
}

let updateAlert = (alert_id, trigger_price) => {
    Alert.findOne({ _id: alert_id })
        .then((doc) => {
            console.log(doc)
            doc.trigger_price = trigger_price
            doc.save((err) => { if (err) { console.log(err, 'error') } })
        })
}

module.exports = { getAlerts, createAlert, updateAlertStatus, updateAlert }