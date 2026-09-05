const express = require("express");
const router = express.Router();
const { getCenters, bookSlot, getTokens, getTokenById } = require("../controllers/procurementController");

router.get("/centers", getCenters);
router.post("/book", bookSlot);
router.get("/tokens", getTokens);
router.get("/tokens/:tokenId", getTokenById);

module.exports = router;
