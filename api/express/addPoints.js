const express = require("express");

const { VALID_TYPES, adjustScore } = require("../../database/leaderboards");
const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();

router.post("/:type", checkAuth, async (req, res) => {
  const type = req.params.type?.toLowerCase();
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const score = Number(req.body?.score);
  if (!Number.isSafeInteger(score) || score === 0) {
    return res.status(400).json({ error: "Score must be a non-zero integer" });
  }

  const userId = req.user.id;
  const displayName = req.user.nick || req.user.username;

  try {
    const result = await adjustScore({
      type,
      userId,
      name: displayName,
      delta: score,
    });
    const newLeader = result.leaderboard[0] || null;

    await sendDiscordLog(
      getRandomMessage(
        result.userWasInLeaderboard
          ? MESSAGE_SETS.ADD
          : MESSAGE_SETS.FIRST_ENTRY,
        {
          user: displayName,
          type,
          score,
          total: result.newScore,
        },
      ),
    );

    if (
      newLeader?.user_id === userId &&
      result.previousLeader &&
      result.previousLeader.user_id !== userId
    ) {
      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.FIRST_PLACE, {
          user: displayName,
          previousLeader: result.previousLeader.name,
          type,
        }),
      );
    }

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

    console.error("Point update failed:", error);
    return res.status(500).json({ error: "Score update failed" });
  }
});

module.exports = router;
