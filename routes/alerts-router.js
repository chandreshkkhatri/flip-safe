const express = require('express')
const router = express.Router()
const cors = require('cors')
const bodyParser = require('body-parser');
const alerts = require('../actions/alerts')

router.use(cors())

router.use(function (req, res, next) {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.get('/create-alert', (req, res) => {
    let { tradingsymbol, trigger_price, trigger_type } = req.body
    alerts.createAlert(tradingsymbol, trigger_price, trigger_type)
    res.send('Bonjour!')
})
router.get('/get-alerts', (req, res) => {
    alerts.getAlerts('all')
    res.send('Bonjour!')
})
module.exports = router
