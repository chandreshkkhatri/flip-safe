const express = require('express')
const router = express.Router()
const cors = require('cors')
const sessionModel = require('../models/session')
const session = require('../session')
const cred = require('../app-cred.json')
let client_url
router.use(cors())

router.use((req, res, next) => {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.get('/check-status', async (req, res) => {
    if (session.kc.access_token) {
        res.send({ isLoggedIn: true })
    }
    else {
        let _session = await sessionModel.retrieveSession()
        let kc = session.kc
        if (_session.status === 'success') {
            let access_token = _session.session.access_token
            kc.setAccessToken(access_token)
            kc.setSessionExpiryHook(invalidateLocalSession)
            session.kc = kc
            res.send({ isLoggedIn: true })
        }
        else {
            res.send({ isLoggedIn: false, message: 'User Not Logged in', login_url: `https://kite.trade/connect/login?v=3&api_key=${cred.api_key}` });
        }
    }
})
router.get('/set-login-info', (req, res) => {
    client_url = req.query.url
    res.send('port set')
})
router.get('/login', (req, res) => {
    let response = req.query
    if (response.status === 'success') {
        request_token = response.request_token
        console.log('response received successfully', request_token)
        session.kc.generateSession(request_token, cred.api_secret)
            .then((response) => {
                session.kc.setSessionExpiryHook(invalidateLocalSession)
                console.log(response)
                sessionModel.storeSession(session.kc.access_token)
                res.redirect(`${client_url}`)
            })
            .catch((err) => {
                console.log(err);
                res.redirect(`${client_url}`)
            });
    }
    else { res.send('login error') }
})
router.get('/logout', (req, res) => {
    invalidateAccessToken()
    invalidateLocalSession()
    res.send({ isLoggedIn: false, message: 'Successfully Logged Out', login_url: `https://kite.trade/connect/login?v=3&api_key=${cred.api_key}` })
})

let invalidateLocalSession = () => {
    session.reset()
    sessionModel.clearSession()
}
let invalidateAccessToken = () => {
    session.kc.invalidateAccessToken()
}
module.exports = router