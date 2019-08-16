var mongoose = require('mongoose');

var exitTriggerSchema = new mongoose.Schema({ variety: String, order_id: String, tradingsymbol: String, trigger_price: String, status: String })
var ExitTrigger = mongoose.model('ExitTrigger', exitTriggerSchema)

var orderTriggerSchema = new mongoose.Schema({})
var OrderTrigger = mongoose.model('OrderTrigger', orderTriggerSchema)

let getExitTriggers = () => {
    return ExitTrigger.find()
}
let createExitTrigger = (trigger) => {
    let exitTrigger = new ExitTrigger(trigger)
    exitTrigger.save((err) => { if (err) { console.log(err, 'Error Storing Trigger to DB') } })
}

let getOrderTriggers = () => {
    return OrderTrigger.find()
}

let createOrderTrigger = (trigger) => {
    let orderTrigger = new OrderTrigger(trigger)
    orderTrigger.save(err => { if (err) { console.log(err, "Error Storing Trigger to DB") } })
}

module.exports = {
    getExitTriggers, createExitTrigger,
    getOrderTriggers, createOrderTrigger
}