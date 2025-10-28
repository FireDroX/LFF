const express = require("express");
const router = express.Router();

router.use("/get/token", require("./getToken"));
router.use("/get/me", require("./getMe"));
router.use("/leaderboard/current", require("./currentTop"));
router.use("/leaderboard/history", require("./historyTops"));
router.use("/points/add", require("./addPoints"));
router.use("/points/remove", require("./removePoints"));

module.exports = router;
