const kc = require('../session').kc;
const limiter = require('../utils/limiter');
const orders = require('../models/orders');
let exitTriggerQueue = [];
let orderTriggerQueue = [];

orders
  .getExitTriggers()
  .then(res => {
    exitTriggerQueue = res;
  })
  .catch(err => console.log(err));
orders
  .getOrderTriggers()
  .then(res => {
    orderTriggerQueue = res;
  })
  .catch(err => console.log(err));

let placeOrder = (variety, params) => {
  return limiter.schedule(kc.placeOrder, variety, params);
};
let exitOrder = (variety, order_id) => {
  return limiter.schedule(kc.exitOrder, variety, order_id);
};

let createOrderTrigger = (variety, params, trigger_type, trigger_price) => {
  let trigger = { variety, params, trigger_type, trigger_price, status: 'pending' };
  orders.createOrderTrigger(trigger);
  orderTriggerQueue.push(trigger);
};
let scanOrderTriggerQueue = ticks => {
  for (let it in orderTriggerQueue) {
    let matched = false;
    let jt = 0;
    let l = ticks.length;
    while (!matched) {
      if (orderTriggerQueue[it].tradingsymbol === ticks[jt % l].tradingsymbol) {
        console.log('matched', ticks[jt]);
        matched = true;
        ///check if trigger condition is met,call executeTrigger, mark the orderTriggerQueue as complete on db, pop the trigger out of the queue
      }
      jt++;
    }
  }
};
let executeOrderTrigger = () => {
  ///to be implemented
};

let createExitTrigger = (variety, order_id, tradingsymbol, trigger_type, trigger_price) => {
  let trigger = {
    variety,
    order_id,
    tradingsymbol,
    trigger_price,
    trigger_type,
    status: 'pending',
  };
  orders.createExitTrigger(trigger);
  exitTriggerQueue.push(trigger);
};
let scanExitTriggerQueue = ticks => {
  for (let it in exitTriggerQueue) {
    let matched = false;
    let jt = 0;
    let l = ticks.length;
    while (!matched) {
      if (exitTriggerQueue[it].tradingsymbol === ticks[jt % l].tradingsymbol) {
        console.log('matched', ticks[jt]);
        matched = true;
        ///check if trigger condition is met,call executeTrigger, mark the exitTriggerQueue as complete on db, pop the trigger out of the queue
      }
      jt++;
    }
  }
};
let executeExitTrigger = () => {
  ///to be implemented
};
let returnExitTriggerQueue = () => {
  return exitTriggerQueue;
};
let returnOrderTriggerQueue = () => {
  return orderTriggerQueue;
};

module.exports = {
  placeOrder,
  exitOrder,
  createOrderTrigger,
  scanOrderTriggerQueue,
  createExitTrigger,
  scanExitTriggerQueue,
  returnExitTriggerQueue,
  returnOrderTriggerQueue,
};
