var mongoose = require('mongoose');

var kiteConnectSessionSchema = new mongoose.Schema({ access_token: String })
var KiteConnectSession = mongoose.model('KiteConnectSession', kiteConnectSessionSchema)

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
module.exports = { storeSession, retrieveSession, clearSession }