const express = require("express");
const router = express.Router();
const { loginDemoUser, getUserProfile } = require("../controllers/authController");

router.post("/login-demo", loginDemoUser);
router.get("/profile", getUserProfile);

module.exports = router;
