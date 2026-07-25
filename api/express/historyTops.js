const express = require("express");

const { getHistory } = require("../../database/leaderboards");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    return res.json(await getHistory());
  } catch (error) {
    console.error("Leaderboard history retrieval failed:", error);
    return res.status(500).json({ error: "Unable to retrieve history" });
  }
});

module.exports = router;
