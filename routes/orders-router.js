const express = require('express')
const router = express.Router()
const cors = require('cors')
const bodyParser = require('body-parser');
const order = require('../actions/orders')

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(cors())

router.use(function (req, res, next) {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.post('/create-order', (req, res) => {
    let payload = req.params
    console.log(payload)
    res.send('Bonjour!')
})
router.post('/exit-order', (req, res) => {
    let { variety, order_id } = req.body
    order.exitOrder(variety, order_id)
        .then((response) => {
            console.log('response', response)
            res.send(response)
        })
        .catch((err) => console.log('error', err))
})
router.post('/create-exit-trigger', (req, res) => {
    let { variety, order_id, tradingsymbol, trigger_price } = req.body
    order.createExitTrigger(variety, order_id, tradingsymbol, trigger_price)
    res.send('create-exit-trigger called')
})
module.exports = router
