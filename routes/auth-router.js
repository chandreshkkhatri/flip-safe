const express = require('express')
const router = express.Router()
const cors = require('cors')
const dbModule = require('../db-module/db-module')
const sessionMethods = { storeSession: dbModule.storeSession, retrieveSession: dbModule.retrieveSession, clearSession: dbModule.clearSession }
let client_url
router.use(cors())

router.use(function (req, res, next) {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.get('/check-status', async (req, res, next) => {
    if (req.app.locals.kc.access_token) {
        res.send({ isLoggedIn: true })
    }
    else {
        let session = await sessionMethods.retrieveSession()
        let kc = req.app.locals.kc
        if (session.status === 'success') {
            let access_token = session.session.access_token
            kc.setAccessToken(access_token)
            kc.setSessionExpiryHook(() => invalidateLocalSession(req))
            req.app.locals.kc = kc
            res.send({ isLoggedIn: true })
        }
        else {
            res.send({ isLoggedIn: false, message: 'User Not Logged in', login_url: `https://kite.trade/connect/login?v=3&api_key=${req.app.locals.cred.api_key}` });
        }
    }
})
router.get('/set-login-info', (req, res, next) => {
    client_url = req.query.url
    res.send('port set')
})
router.get('/login', (req, res) => {
    let response = req.query
    if (response.status === 'success') {
        request_token = response.request_token
        console.log('response received successfully', request_token, req.app.locals.cred.api_secret)
        req.app.locals.kc.generateSession(request_token, req.app.locals.cred.api_secret)
            .then((response) => {
                req.app.locals.kc.setSessionExpiryHook(() => invalidateLocalSession(req))
                console.log(response)
                sessionMethods.storeSession(req.app.locals.kc.access_token)
                res.redirect(`${client_url}`)
            })
            .catch((err) => {
                console.log(err);
                res.redirect(`${client_url}`)
            });
    }
    else { res.send('login error') }
})
router.get('/logout', (req, res, next) => {
    invalidateAccessToken(req)
    invalidateLocalSession(req)
    res.send({ isLoggedIn: false, message: 'Successfully Logged Out', login_url: `https://kite.trade/connect/login?v=3&api_key=${req.app.locals.cred.api_key}` })
})

let invalidateLocalSession = (req) => {
    req.app.locals.reset()
    sessionMethods.clearSession()
}
let invalidateAccessToken = (req) => {
    req.app.locals.kc.invalidateAccessToken()
}
module.exports = router