const express = require("express");

const { VALID_TYPES, adjustScore } = require("../../database/leaderboards");
const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { getRandomMessage, MESSAGE_SETS } = require("../../utils/messages");

const router = express.Router();

router.patch("/:type", checkAuth, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const type = req.params.type?.toLowerCase();
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const delta = Number(req.body?.delta);
  const userId = req.body?.userId;
  const username = req.body?.username || "Unknown";

  if (!Number.isSafeInteger(delta) || delta === 0) {
    return res
      .status(400)
      .json({ error: "A non-zero integer delta is required" });
  }
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await adjustScore({
      type,
      userId,
      name: username,
      delta,
    });

    await sendDiscordLog(
      getRandomMessage(
        delta > 0 ? MESSAGE_SETS.STAFF_ADD : MESSAGE_SETS.STAFF_REMOVE,
        {
          staff: req.user.username,
          target: username,
          score: Math.abs(delta),
          type,
          total: result.newScore,
        },
      ),
    );

    return res.json({
      users: result.leaderboard.map((row) => ({
        userId: row.user_id,
        name: row.name,
        score: row.score,
        rank: row.rank,
      })),
      start: result.top.start_date,
      end: result.top.end_date,
      type,
    });
  } catch (error) {
    if (error.code === "NO_ACTIVE_TOP") {
      return res.status(404).json({ error: "No active leaderboard found" });
    }

    console.error("Staff leaderboard adjustment failed:", error);
    return res.status(500).json({ error: "Score update failed" });
  }
});

module.exports = router;
