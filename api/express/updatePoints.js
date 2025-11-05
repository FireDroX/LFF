const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const {
  getRandomMessage,
  STAFF_ADD_MESSAGES,
  STAFF_REMOVE_MESSAGES,
} = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_TYPES = ["crystaux", "iscoin", "dragonegg", "beacon", "sponge"];

router.patch("/:type", checkAuth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const type = req.params.type?.toLowerCase();
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid leaderboard type" });
    }

    const { delta, username, userId } = req.body || {};

    const scoreDelta = Number(delta);
    if (!Number.isFinite(scoreDelta) || scoreDelta === 0) {
      return res
        .status(400)
        .json({ error: "A non-zero numeric delta is required" });
    }

    const trimmedName = typeof username === "string" ? username.trim() : "";
    if (!trimmedName && !userId) {
      return res
        .status(400)
        .json({ error: "Target username or userId is required" });
    }

    const now = new Date();

    let { data: currentTop, error } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .or(
        `and(start_date.lte.${now.toISOString()},end_date.gte.${now.toISOString()}),and(start_date.is.null,end_date.is.null)`
      )
      .single();

    if (error || !currentTop) {
      console.error(
        `Staff adjustment failed: top not found for type ${type}`,
        error
      );
      return res
        .status(500)
        .json({ error: "Impossible de récupérer le classement." });
    }

    const users = Array.isArray(currentTop.users) ? [...currentTop.users] : [];

    const findIndexBy = (predicate) => {
      const index = users.findIndex(predicate);
      return index >= 0 ? index : -1;
    };

    let userIndex =
      userId != null ? findIndexBy((u) => u.userId === userId) : -1;

    if (userIndex === -1 && trimmedName) {
      const lowerName = trimmedName.toLowerCase();
      userIndex = findIndexBy(
        (u) => typeof u.name === "string" && u.name.toLowerCase() === lowerName
      );
    }

    let logTargetName = trimmedName;
    let newTotal = scoreDelta;

    if (userIndex === -1) {
      if (scoreDelta < 0) {
        return res.status(400).json({
          error: "Cannot remove points from a user who has no score yet",
        });
      }

      const newEntry = {
        name: trimmedName,
        score: scoreDelta,
        userId: userId || null,
      };

      users.push(newEntry);
      logTargetName = trimmedName;
      newTotal = newEntry.score;
    } else {
      const previousScore = Number(users[userIndex].score) || 0;
      const updatedScore = previousScore + scoreDelta;

      if (trimmedName) {
        users[userIndex].name = trimmedName;
      }
      if (userId) {
        users[userIndex].userId = userId;
      }

      logTargetName = users[userIndex].name || trimmedName;

      if (updatedScore <= 0) {
        users.splice(userIndex, 1);
        newTotal = 0;
      } else {
        users[userIndex].score = updatedScore;
        newTotal = updatedScore;
      }
    }

    const { error: updateError } = await supabase
      .from("tops")
      .update({ users })
      .eq("id", currentTop.id);

    if (updateError) {
      console.error("Erreur update classement staff:", updateError);
      return res
        .status(500)
        .json({ error: "Impossible de mettre à jour le classement" });
    }

    const sortedUsers = [...users].sort((a, b) => b.score - a.score);

    const logMessage = getRandomMessage(
      scoreDelta > 0 ? STAFF_ADD_MESSAGES : STAFF_REMOVE_MESSAGES,
      {
        staff: req.user.username,
        target: logTargetName || "Unknown",
        score: Math.abs(scoreDelta),
        type,
        total: newTotal,
      }
    );
    await sendDiscordLog(logMessage);

    return res.json({
      users: sortedUsers,
      start: currentTop.start_date,
      end: currentTop.end_date,
      type: currentTop.type,
    });
  } catch (err) {
    console.error("Error in staff leaderboard adjustment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
