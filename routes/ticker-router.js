const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const ticker = require('../actions/ticker')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

router.get("/", (req, res) => {
  res.send("Bonjour! You've reached the ticker router");
});
router.get("/is-connected", async (req, res) => {
  let status = await ticker.connected()
  res.send(status);
});
router.get("/connect", async (req, res) => {
  ticker.startStoringTicks()
  ticker.initializeTicker()
  ticker.connect()
  res.send(true);
});
router.get("/disconnect", async (req, res) => {
  let connected = await ticker.connected()
  if (connected) {
    ticker.disconnect();
  }
  res.send({ status: true })
});
router.get("/get-ticks", async (req, res) => {
  res.send({ ticks: ticker.tickCache })
});
router.get("/clear-cache", (req, res) => {
  ticker.clearCache()
  res.send(true)
})
router.get("/test", async (req, res) => {
  res.send(ticker)
})

module.exports = router;
