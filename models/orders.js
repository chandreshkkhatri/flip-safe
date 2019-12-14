var mongoose = require('mongoose');

var exitTriggerSchema = new mongoose.Schema({ variety: String, order_id: String, tradingsymbol: String, trigger_price: String, trigger_type: String, status: String })
var ExitTrigger = mongoose.model('ExitTrigger', exitTriggerSchema)

var orderTriggerSchema = new mongoose.Schema({ variety: String, params: String, trigger_price: String, trigger_type: String, status: String })
var OrderTrigger = mongoose.model('OrderTrigger', orderTriggerSchema)

let getExitTriggers = () => {
    return ExitTrigger.find()
}

let createExitTrigger = (trigger) => {
    let exitTrigger = new ExitTrigger(trigger)
    exitTrigger.save((err) => { if (err) { console.log(err, 'Error Storing Trigger to DB') } })
}

let updateExitTrigger = (trigger_id, updated_status) => {           //status: pending, triggered, cancelled
    ExitTrigger.findOne({ _id: trigger_id })
        .then((doc) => {
            doc.status = updated_status
            doc.save()
        })
        .catch((err) => console.log(err))
}

let getOrderTriggers = () => {
    return OrderTrigger.find()
}

let createOrderTrigger = (trigger) => {
    let orderTrigger = new OrderTrigger(trigger)
    orderTrigger.save(err => { if (err) { console.log(err, "Error Storing Trigger to DB") } })
}

let updateOrderTrigger = (trigger_id, updated_status) => {
    OrderTrigger.findOne({ _id: trigger_id })
        .then((doc) => {
            doc.status = updated_status
            doc.save()
        })
        .catch((err) => console.log(err))
}
module.exports = {
    getExitTriggers, createExitTrigger, updateExitTrigger,
    getOrderTriggers, createOrderTrigger, updateOrderTrigger
}