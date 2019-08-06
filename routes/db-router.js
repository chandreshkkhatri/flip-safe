const express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser');
const mwdb = require('../db/marketwatch')
const cacheModule = require('../db/cache-data')
const kc = require('./auth-router')
const router = express.Router()

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(cors())

router.get('/', (req, res) => {
  res.send(`Bonjour! You've reached database router`)
})

router.get('/update-instruments-db', (req, res) => {
  mwdb.updateInstruementDB(kc)
  res.send('Request updated instrument list from broker')
})
router.get('/get-list-of-mw', async (req, res) => {
  let response = await mwdb.getMWInfo()
  res.send(response)
})
router.post('/create-new-mw', async (req, res) => {
  let mwInfo = req.body.mwInfo
  let response = await mwdb.createNewMarketWatch(mwInfo)
  res.send(response)
})
router.post('/update-mw-info', async (req, res) => {
  let mwInfo = req.body
  let response = await mwdb.updateMWInfo(mwInfo)
  res.send(response)
})
router.get('/query-instruments', async (req, res) => {
  let queryString = req.query['queryString']
  let filterString = req.query['filterString']
  let queryResult = await mwdb.getInstrumentQuery(queryString, filterString)
  res.send(queryResult)
})
router.post('/add-instrument-to-collection', (req, res) => {
  let data = req.body
  let mwName = data.mwName + '-instrument'
  let instrument = data.instrument
  mwdb.addInstrument(mwName, instrument)
  res.send('testing')
})
router.get('/delete-instrument', (req, res) => {
  let mwName = req.query['mwName'] + '-instrument'
  let instrument_token = req.query['instrument_token']
  mwdb.deleteInstrument(mwName, instrument_token)
  res.send('delete request received')
})
router.get('/get-mw-data', async (req, res) => {
  let mwName = req.query['mwName'] + '-instrument'
  let mwData = await mwdb.getMWData(mwName)
  res.send(mwData)
})
router.get('/get-ticker-info', async (req, res) => {
  let response = []
  for (let it = 1; it < 4; ++it) {
    let tickerId = 'ticker' + it
    let tickerInfo = await mwdb.getTickerInfo(tickerId)
    response.push(tickerInfo)
  }
  res.send(response)
})
router.get('/subscribe-to-ticker', async (req, res) => {
  let mwName = req.query.mwName
  let tickerId = req.query.tickerId
  let response = await mwdb.subscribeToTicker(mwName, tickerId)
  res.send(`subscribed to ${response.newInstrumentsCounter} instruments of ${response.totalInstruments}. ${response.existingInstrumentCounter} already exist`)
})
router.get('/clear-ticker', async (req, res) => {
  let tickerId = req.query.tickerId
  mwdb.clearTicker(tickerId)
  res.send('clear request received, check server console for errors')
})
router.get('/get-ticker-instruments', async (req, res) => {
  let tickerId = req.query.tickerId
  let tickerData = await mwdb.getMWData(tickerId)
  res.send(tickerData)
})
router.post('/cache-data', async (req, res) => {
  let payload = req.body
  let { instrument_token, interval, from_date, to_date } = payload
  let data
  await kc.getHistoricalData(instrument_token, interval, from_date, to_date)
    .then((response) => {
      data = response
      cacheModule.cacheData(instrument_token, interval, data)
      res.send('data')
    })
    .catch((err) => {
      cacheModule.sendToPendingCacheStack(instrument_token, interval, from_date, to_date)
      console.log(err)
      console.log(`error fetching historical candlestick, sending to cacheStack`, instrument_token)
      res.send('error')
    })
})
router.get('/clear-pending-cache-stack', (req, res) => {
  cacheModule.clearCacheStack(kc)
  res.send('Clearing Stack')
})

router.get('/flush-cache-stack', (req, res) => {
  cacheModule.flushCacheStack()
  cacheModule.clearConsoleCounter()
  res.send('Flushing Cache Stack')
})
router.get('/flush-simulation-data', (req, res) => {
  let date = req.query.date
  mwdb.flushSimulationData(date)
  res.send('flshing')
})
module.exports = router
