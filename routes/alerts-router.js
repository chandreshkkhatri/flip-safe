const express = require('express')
const router = express.Router()
const cors = require('cors')
// const dbModule = require('../db-module/db-module')
router.use(cors())

router.use(function (req, res, next) {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.get('/create-alert', (req, res) => {
    res.send('Bonjour!')
})
router.get('/get-alerts', (req, res) => {
    res.send('Bonjour!')
})
module.exports = router
