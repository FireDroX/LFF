const express = require("express");
const router = express.Router();


router.use("/healthz", require("./healthz"));
router.use("/get/token", require("./getToken"));
router.use("/get/me", require("./getMe"));
router.use("/leaderboard/current", require("./currentTop"));
router.use("/leaderboard/history", require("./historyTops"));
router.use("/leaderboards/update", require("./updatePoints"));
router.use("/points/add", require("./addPoints"));
router.use("/profile", require("./profile"));

module.exports = router;
