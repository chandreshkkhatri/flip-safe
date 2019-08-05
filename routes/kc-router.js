const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const Bottleneck = require("bottleneck/es5");
const simulator = require('../scripts/simulator')
const router = express.Router()
const session = require('../session')

const limiter = new Bottleneck({
    minTime: 333
});

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(cors())

router.get('/', (req, res) => {
    res.send("Bonjour! You've reached the Kite Connect router")
})

router.get('/get-profile', async (req, res) => {
    session.kc.getProfile()
        .then((response) => {
            res.send(response)
        })
        .catch((err) => {
            console.log('err', err)
            res.status(500).send('error getting profile')
        })
})
router.get('/get-margins', async (req, res) => {
    const segment = req.query.segment           //optional argument to the method, equity/commodity
    session.kc.getMargins()
        .then((response) => {
            res.send(response)
        })
        .catch((err) => {
            console.log('err', err)
            res.status(500).send('error getting profile')
        })
})
router.post('/get-ohlc', async (req, res) => {
    let instruments = req.body.instruments
    session.kc.getOHLC(instruments)
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('err', err)
            res.status(500).send('error fetching ohlc data')
        })
})
router.post('/get-ltp', async (req, res) => {
    let instruments = req.body.instruments
    session.kc.getLTP(instruments)
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('err', err)
            res.status(500).send('error getting ltp')
        })
})
router.post('/get-quotes', async (req, res) => {
    let instruments = req.body.instruments
    session.kc.getQuote(instruments)
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('err', err)
            res.status(500).send('error getting quotes')
        })
})
router.get('/get-positions', async (req, res) => {
    session.kc.getPositions()
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('error getting holdings', err)
            res.status(500).send('error getting positions')
        })
})
router.get('/get-holdings', async (req, res) => {
    session.kc.getHoldings()
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('error getting holdings', err)
            res.status(500).send('error getting holdings')
        })
})
router.get('/get-orders', async (req, res) => {
    session.kc.getOrders()
        .then((response) => {
            res.send(response)
        })
        .catch((err) => {
            console.log('error getting orders', err)
            res.status(500).send('error getting orders')
        })
})
router.get('/get-trades', async (req, res) => {
    session.kc.getTrades()
        .then((response) => res.send(response))
        .catch((err) => {
            console.log('error getting trades', err)
            res.status(500).send('error getting trades')
        })
})
router.post('/get-historical-data', async (req, res) => {
    let payload = req.body
    let { instrument_token, interval, from_date, to_date, instrument_type } = payload
    if (instrument_type === 'derivative') {
        session.kc.getHistoricalData(instrument_token, interval, from_date, to_date, 1)
            .then((response) => {
                res.send(response)
            })
            .catch((err) => {
                console.log(err, 'erre feteching candles')
                res.status(500).send('error fetching candles')
            })
    } else {
        session.kc.getHistoricalData(instrument_token, interval, from_date, to_date, 0)
            .then((response) => {
                res.send(response)
            })
            .catch((err) => {
                console.log(err, 'erre feteching candles')
                res.status(500).send('error fetching candles')
            })
    }
})
router.get('/request-simulation-data', async (req, res) => {
    let { instrument_token, date } = req.query
    let from_date = date + ' 00:01:00'
    let to_date = date + ' 23:59:00'
    let interval = 'minute'
    //add caching mechanism to local db
    let data = await simulator.getSimulationData(instrument_token, interval, date)
    if (data.doc) {
        res.send({ status: true, data: data.doc })
    }
    else {
        limiter.schedule(() => session.kc.getHistoricalData(instrument_token, interval, from_date, to_date))
            .then((response) => {
                simulator.storeSimulationData(instrument_token, interval, date, response)
                res.send({ status: true, data: response })
            })
            .catch((err) => {
                console.log(err)
                res.send({ status: false, data: err })
            })
    }
})
router.get('/flush-simulation-data', async (req, res) => {
    simulator.flushSimulationData()
    res.send(true)
})

module.exports = router
