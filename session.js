const KiteConnect = require("kiteconnect").KiteConnect;
let cred = require('./app-cred.json')
let kc = new KiteConnect({ api_key: cred.api_key });
let reset = () => {
    kc = new KiteConnect({ api_key: cred.api_key });
    // console.log('cred', cred)
}
let active_ticker_access_token

module.exports = { kc, reset, active_ticker_access_token }