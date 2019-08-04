const KiteConnect = require("kiteconnect").KiteConnect;
let cred = require('./app-cred.json')
let kc = new KiteConnect({ api_key: cred.api_key });
let reset = () => {
    kc = new KiteConnect({ api_key: cred.api_key });
    // console.log('cred', cred)
}


module.exports = { kc, reset }