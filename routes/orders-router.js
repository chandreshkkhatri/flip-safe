const express = require('express')
const router = express.Router()
const cors = require('cors')
router.use(cors())

router.use(function (req, res, next) {
    next();
});

// define the home page route
router.get('/', (req, res) => {
    res.send('Bonjour!')
})
router.get('/create-trigger', (req, res) => {
    res.send('Bonjour!')
})
module.exports = router
