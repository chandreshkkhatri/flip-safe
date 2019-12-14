const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const tickerHandler = require('../handlers/ticker')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

router.get("/", (req, res) => {
  res.send("Bonjour! You've reached the ticker router");
});
router.get("/is-connected", async (req, res) => {
  let status = await tickerHandler.connected()
  res.send(status);
});
router.get("/connect", async (req, res) => {
  tickerHandler.startStoringTicks()
  tickerHandler.initializeTicker()
  tickerHandler.connect()
  res.send(true);
});
router.get("/disconnect", async (req, res) => {
  let connected = await tickerHandler.connected()
  if (connected) {
    tickerHandler.disconnect();
  }
  res.send({ status: true })
});
router.get("/get-ticks", async (req, res) => {
  res.send({ ticks: tickerHandler.getTicks() })
});
router.get("/clear-cache", (req, res) => {
  tickerHandler.clearCache()
  res.send(true)
})
router.get("/test", async (req, res) => {
  res.send(tickerHandler)
})

module.exports = router;
