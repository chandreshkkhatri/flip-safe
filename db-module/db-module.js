var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/zdb', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { });
let console_counter = 0

var ticksSchema = new mongoose.Schema({
    instrument_token: String,
    ticks: Array
})
var Ticks = mongoose.model('Ticks', ticksSchema)

var kiteConnectSessionSchema = new mongoose.Schema({ access_token: String })
var KiteConnectSession = mongoose.model('KiteConnectSession', kiteConnectSessionSchema)

var candleStickDataSchema = new mongoose.Schema({
    instrument_token: String,
    interval: String,
    candleStickData: Array
})
var CandleStickData = mongoose.model('CandleStickData', candleStickDataSchema)

var SimulationDataSchema = new mongoose.Schema({
    instrument_token: String,
    interval: String,
    date: String,
    candleStickData: Array
})
var SimulationData = mongoose.model('SimulationData', SimulationDataSchema)

var instrumentsSchema = new mongoose.Schema({
    instrument_token: String, tradingsymbol: String, exchange_token: String, name: String, last_price: String, expiry: String, strike: String, tick_size: String, lot_size: String, instrument_type: String, segment: String, exchange: String
})
var Instruments = mongoose.model('Instruments', instrumentsSchema)

var marketWatchInfoSchema = new mongoose.Schema({
    name: String,
    appInfo: Array
})
var MarketWatchInfo = mongoose.model('MarketWatchInfo', marketWatchInfoSchema)

var cacheRequestSchema = new mongoose.Schema({
    instrument_token: String,
    interval: String,
    from_date: String,
    to_date: String
})
var CacheRequest = mongoose.model('CacheRequest', cacheRequestSchema)

let updateInstruementDB = async (kc) => {
    await Instruments.deleteMany({}, (err) => {
        if (err) {
            console.log(err, 'error')
        }
    })
    kc.getInstruments()
        .then((res) => {
            Instruments.insertMany(res, (error, docs) => {
                if (error) {
                    console.log(error)
                }
                console.log('update complete')
            })
        })
        .catch((err) => console.log(err))
    return "request instruments from zerodha"
}
let createNewMarketWatch = async (mwInfo) => {
    let response
    let name = mwInfo.name
    let appInfo = mwInfo.appInfo
    await MarketWatchInfo.findOne({ name })
        .then((res) => {
            if (res === null) {
                new MarketWatchInfo({ name, appInfo: [appInfo] }).save()
                response = "Marketwatch created"
            }
            else {
                let flag = true
                for (let it in res.appInfo) {
                    if (res.appInfo[it]['name'] === appInfo.name) {
                        flag = false
                        response = "A marketwatch by this name already exits" //for this app
                    }
                }
                if (flag) {
                    let appInfoNew = res.appInfo
                    appInfoNew.push(appInfo)
                    res.appInfo = appInfoNew
                    res.save()
                    response = "Marketwatch created"
                    //save appInfoNew to MW info
                }
            }
        })
        .catch((err) => console.log(err))
    return response
}
let updateMWInfo = async (mwInfo) => {
    let appName = mwInfo.appName
    let listToDelete = mwInfo.listOfUpdates.listToDelete
    let listToUpdateStatus = mwInfo.listOfUpdates.listToUpdateStatus
    let response = {}
    for (let it in listToDelete) {
        await MarketWatchInfo.findOne({ name: listToDelete[it]['name'] })
            .then((doc) => {
                for (let i in doc.appInfo) {
                    if (doc.appInfo[i].name === appName) {
                        doc.appInfo.splice(i, 1)
                    }
                }
                doc.save()
                response.deleted = true
            })
            .catch((err) => console.log(err))
    }
    for (let it in listToUpdateStatus) {
        await MarketWatchInfo.findOne({ name: listToUpdateStatus[it]['name'] })
            .then((doc) => {
                let appInfo = doc.appInfo
                for (let i in appInfo) {
                    if (appInfo[i].name === appName) {
                        appInfo[i].status = listToUpdateStatus[it].status
                    }
                }
                doc.appInfo = appInfo
                doc.markModified('appInfo')
                doc.save((err) => { if (err) { console.log(err, 'error') } })
                response.updated = true
            })
            .catch((err) => console.log(err))
    }
    return response
}
let getInstrumentQuery = async (queryString, filterString) => {
    let response
    let filter = []
    switch (filterString) {
        case 'EQ':
            filter = [{ exchange: 'NSE' }, { exchange: 'BSE' }]
            break;
        case 'NFO':
            filter = [{ exchange: 'NFO' }]
            break;
        case 'MCX':
            filter = [{ exchange: 'MCX' }]
            break;
        case 'CDS':
            filter = [{ exchange: 'CDS' }]
            break;
        default:
        // code block
    }
    await Instruments.find({ tradingsymbol: { "$regex": "^" + queryString.toUpperCase() }, $or: filter })
        .then((res) => { response = res })
    return response
}
let addInstrument = (mwName, instrument) => {
    let NewMWModel = new mongoose.model(mwName, instrumentsSchema)
    new NewMWModel(instrument).save()
    return 'saved'
}
let deleteInstrument = (mwName, instrument_token) => {
    let NewMWModel = new mongoose.model(mwName, instrumentsSchema)
    NewMWModel.deleteOne({ instrument_token })
        .then((res) => console.log(res))
        .catch((err) => console.log(err))
}
let getMWData = async (mwName) => {
    let response
    let NewMWModel = new mongoose.model(mwName, instrumentsSchema)
    await NewMWModel.find()
        .then((res) => response = res)
        .catch((err) => console.log(err))
    return response
}
let getMWInfo = async () => {
    let response
    await MarketWatchInfo.find()
        .then((docs) => response = docs)
        .catch((err) => response = err)
    return response
}
let subscribeToTicker = async (mwName, tickerId) => {
    let mwData = await getMWData(mwName + '-instrument')
    let tickerData = await getMWData(tickerId)
    let instrumentsToAdd = []
    let totalInstruments = mwData.length
    let newInstrumentsCounter = 0
    let existingInstrumentCounter = 0
    for (let i in mwData) {
        let notPresent = true
        for (let j in tickerData) {
            if (mwData[i].exchange_token === tickerData[j].exchange_token) {
                notPresent = false
                existingInstrumentCounter++
            }
        }
        if (notPresent) {
            instrumentsToAdd.push(mwData[i])
            newInstrumentsCounter++
        }
    }
    let NewMWModel = new mongoose.model(tickerId, instrumentsSchema)
    await NewMWModel.insertMany(instrumentsToAdd, (error, docs) => {
        if (error) {
            console.log(error)
        }
    })
    return { newInstrumentsCounter, existingInstrumentCounter, totalInstruments }
}

let cacheData = async (instrument_token, interval, data) => {
    CandleStickData.findOne({ $and: [{ instrument_token }, { interval }] })
        .then((doc) => {
            let inserted = 0
            let exists = 0
            if (doc) {
                let candleStickData = doc.candleStickData
                for (let it in data) {
                    let timeStamp = new Date(data[it]['date'])
                    let date = timeStamp.toLocaleDateString()
                    if (date === 'Invalid Date') {
                        console.log(date)
                    }
                    let flag = true
                    for (let jt in candleStickData) {
                        if (candleStickData[jt]['date'] === date) {
                            flag = false
                            let notPresent = true
                            for (let kt in candleStickData[jt]['candles']) {
                                let candleStickTimeStamp = String(candleStickData[jt]['candles'][kt]['date'])
                                let dataTimeStamp = String(data[it]['date'])
                                if (candleStickTimeStamp === dataTimeStamp) {
                                    exists++
                                    notPresent = false
                                    // under the assumption that single timestamp can have only one entry, it might not be true, keep a check
                                    // we can run a check to find number of inconsistensies once we cache all data
                                }
                            }
                            if (notPresent) {
                                candleStickData[jt]['candles'].push(data[it])
                                inserted++
                            }
                        }
                    }
                    if (flag) {
                        candleStickData.push({ date, candles: [data[it]] })
                        inserted++
                    }
                }
                doc.markModified('candleStickData')
                doc.save((err) => { if (err) { console.log(err) } })
            } else {
                let candleStickData = []
                for (let it in data) {
                    let date = (new Date(data[it]['date'])).toLocaleDateString()
                    let flag = true
                    for (let jt in candleStickData) {
                        if (candleStickData[jt]['date'] === date) {
                            flag = false
                            let notPresent = true
                            for (let kt in candleStickData[jt]['candles']) {
                                let candleStickTimeStamp = String(candleStickData[jt]['candles'][kt]['date'])
                                let dataTimeStamp = String(data[it]['date'])
                                if (candleStickTimeStamp === dataTimeStamp) {
                                    notPresent = false
                                    exists++
                                }
                            }
                            if (notPresent) {
                                candleStickData[jt]['candles'].push(data[it])
                                inserted++
                            }
                        }
                    }
                    if (flag) {
                        candleStickData.push({ date, candles: [data[it]] })
                        inserted++
                    }
                }
                if (candleStickData.length > 0) {
                    let candle = new CandleStickData({ instrument_token, interval, candleStickData })
                    candle.save((err) => { if (err) { console.log(err, 'error saving candlestick data') } })
                }
            }
            console.log(`${inserted} of ${data.length} candles inserted for ${instrument_token}, ${exists} candles already present, ${++console_counter}`)
        })
        .catch((err) => { console.log("error querying db") })
}
let storeSession = async (access_token) => {
    await KiteConnectSession.deleteMany({}, (err) => {
        if (err) {
            console.log(err)
        }
    })
    let kiteConnectSession = new KiteConnectSession({ access_token })
    kiteConnectSession.save((err) => { if (err) { console.log(err, 'Error Storing session to DB') } })
}
let retrieveSession = async () => {
    let response
    await KiteConnectSession.findOne()
        .then((doc) => {
            if (doc) {
                response = { status: 'success', session: doc }
            } else { response = { status: 'error' } }
        })
        .catch((err) => { response = { status: 'error' } })
    return response
}
let clearSession = async () => {
    KiteConnectSession.deleteMany({}, (err) => {
        if (err) {
            console.log(err)
        }
    })
}
let getTickerInfo = async (tickerId) => {
    let tickerInfo
    let NewMWModel = new mongoose.model(tickerId, instrumentsSchema)
    await NewMWModel.countDocuments()
        .then((res) => tickerInfo = { status: 'success', info: res })
        .catch((err) => tickerInfo = { status: 'error' })
    return tickerInfo
}

let clearTicker = (tickerId) => {
    let NewMWModel = new mongoose.model(tickerId, instrumentsSchema)
    NewMWModel.deleteMany({}, (err) => {
        if (err) {
            console.log(err, 'error')
        }
    })
}
// let garbargeCollector = () => {
//     return "Collect Garbage from old MWs"
// }
let sendToPendingCacheStack = (instrument_token, interval, from_date, to_date) => {
    new CacheRequest({ instrument_token, interval, from_date, to_date }).save((err) => {
        if (err) {
            console.log('Error saving cache request')
        }
    })
}

let clearCacheStack = (kc) => {
    CacheRequest.find()
        .then(async (docs) => {
            let requestArray = []
            let t = 0
            let l = docs.length
            console.log(`${l} requests in stack, trying to clear`)
            for (let it in docs) {
                requestArray.push(docs[it])
                await setTimeout(() => {
                }, 400);
                let { instrument_token, interval, from_date, to_date } = requestArray[it]
                await kc.getHistoricalData(instrument_token, interval, from_date, to_date)
                    .then(async (response) => {
                        data = response
                        await cacheData(instrument_token, interval, data)
                        docs[it].remove()
                    })
                    .catch((err) => {
                        console.log('error clearing request', instrument_token)
                        console.log(err)
                    })
            }
        })
        .catch((err) => console.log(err))
}

let flushCacheStack = () => {
    CacheRequest.deleteMany({}, (err) => {
        console.log(`requests in stack flushed`)
        if (err) {
            console.log(err, 'error flushing cache stack')
        }
    })
}

let clearConsoleCounter = () => {
    console_counter = 0
}

let storeSimulationData = (instrument_token, interval, date, candleStickData) => {
    new SimulationData({ instrument_token, interval, date, candleStickData }).save((err) => {
        if (err) { console.log('error saving simulation data') }
    })
}
let getSimulationData = async (instrument_token, interval, date) => {
    let response
    await SimulationData.findOne({ instrument_token, interval, date })
        .then((doc) => { response = { status: true, doc: doc } })
        .catch((err) => { response = { status: false } })
    return response
}
let flushSimulationData = () => {
    SimulationData.deleteMany({}, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

let storeTicks = (payload, timeStamp) => {
    for (let it in payload) {
        let instrument_token = payload[it].instrument_token
        Ticks.findOne({ instrument_token })
            .then((doc) => {
                if (doc === null) {
                    let instrument = new Ticks({ instrument_token, ticks: [{ timeStamp, ticks: payload[it] }] })
                    instrument.save()
                } else {
                    let ticks = doc.ticks
                    ticks.push({ timeStamp, ticks: payload[it] })
                    doc.ticks = ticks
                    doc.markModified('ticks')
                    doc.save((err) => { if (err) { console.log(err, 'error') } })
                }
            })
            .catch((err) => console.log(err))
    }
}

let retrieveTicks = async () => {
    let response
    await Ticks.find()
        .then((docs) => response = docs)
        .catch((err) => console.log(err))
    return response
}

let clearTicksCache = () => {
    Ticks.deleteMany({}, (err) => {
        if (err) {
            console.log(err)
        }
    })
}
module.exports = {
    updateInstruementDB, createNewMarketWatch, updateMWInfo, getInstrumentQuery, addInstrument,
    deleteInstrument, getMWData, subscribeToTicker, cacheData, storeSession, retrieveSession,
    clearSession, getTickerInfo, clearTicker, getMWInfo, storeSimulationData, sendToPendingCacheStack,
    clearCacheStack, flushCacheStack, clearConsoleCounter, getSimulationData, flushSimulationData,
    storeTicks, retrieveTicks, clearTicksCache
}