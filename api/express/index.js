const express = require("express");
const router = express.Router();

router.use("/get/token", require("./getToken"));
router.use("/get/me", require("./getMe"));
router.use("/leaderboard/current", require("./currentTop"));
router.use("/leaderboard/history", require("./historyTops"));
router.use("/leaderboards/update", require("./updatePoints"));
router.use("/points/add", require("./addPoints"));
router.use("/points/remove", require("./removePoints"));
router.use("/profile", require("./profile"));

module.exports = router;
