var mongoose = require('mongoose');

var instrumentsSchema = new mongoose.Schema({
    instrument_token: String, tradingsymbol: String, exchange_token: String, name: String, last_price: String, expiry: String, strike: String, tick_size: String, lot_size: String, instrument_type: String, segment: String, exchange: String
})
var Instruments = mongoose.model('Instruments', instrumentsSchema)

var marketWatchInfoSchema = new mongoose.Schema({
    name: String,
    appInfo: Array
})
var MarketWatchInfo = mongoose.model('MarketWatchInfo', marketWatchInfoSchema)

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


module.exports = {
    updateInstruementDB, createNewMarketWatch, updateMWInfo, getInstrumentQuery, addInstrument,
    deleteInstrument, getMWData, subscribeToTicker, getTickerInfo, clearTicker, getMWInfo,
    
}