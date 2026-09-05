const express = require("express");
const router = express.Router();
const { getWeatherAndRisk } = require("../controllers/weatherController");

router.get("/risk", getWeatherAndRisk);

module.exports = router;
