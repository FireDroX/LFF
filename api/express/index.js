const express = require("express");
const router = express.Router();

const getToken = require("./getToken");
const getMe = require("./getMe");
const currentTop = require("./currentTop");
const addPoints = require("./addPoints");
const removePoints = require("./removePoints");

router.use("/get/token", getToken);
router.use("/get/me", getMe);
router.use("/leaderboard/current", currentTop);
router.use("/points/add", addPoints);
router.use("/points/remove", removePoints);

module.exports = router;
