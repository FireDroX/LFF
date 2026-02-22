const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Route : /points/add/:type
 * Exemple :
 * /points/add/crystaux
 * /points/add/iscoin
 * /points/add/dragonegg
 * /points/add/beacon
 * /points/add/sponge
 * /points/add/pvp
 */

router.post("/:type", checkAuth, async (req, res) => {
  const { type } = req.params;

  if (
    !["crystaux", "iscoin", "dragonegg", "beacon", "sponge", "pvp"].includes(
      type,
    )
  ) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const { score } = req.body;
  const userId = req.user.id;
  const displayName = req.user.nick || req.user.username;

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Score must be a number" });
  }

  try {
    const nowUtc = new Date().toISOString();

    // 🔹 1️⃣ Récupérer le top actif
    let { data: currentTop, error: topError } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .or(
        `and(start_date.lte.'${nowUtc}',end_date.gte.'${nowUtc}'),and(start_date.is.null,end_date.is.null)`,
      )
      .single();

    if (topError || !currentTop) {
      return res.status(404).json({ error: "No active leaderboard found" });
    }

    // 🔹 2️⃣ Leader AVANT update
    const { data: beforeLeaderboard } = await supabase.rpc(
      "get_current_leaderboard",
      { p_type: type },
    );

    const previousLeader = beforeLeaderboard?.[0] || null;

    const userWasInLeaderboard = beforeLeaderboard?.some(
      (u) => u.user_id === userId,
    );

    // 🔹 3️⃣ Incrément atomique côté DB
    const { data: newScore, error: incrementError } = await supabase.rpc(
      "increment_score",
      {
        p_top_id: currentTop.id,
        p_user_id: userId,
        p_score: score,
        p_name: displayName,
      },
    );

    if (incrementError) {
      console.error("increment_score error:", incrementError);
      return res.status(500).json({ error: "Score update failed" });
    }

    // 🔹 4️⃣ Leader APRÈS update
    const { data: updatedLeaderboard } = await supabase.rpc(
      "get_current_leaderboard",
      { p_type: type },
    );

    const newLeader = updatedLeaderboard?.[0] || null;

    // ===========================
    // 🔥 DISCORD LOGS
    // ===========================

    if (!userWasInLeaderboard) {
      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.FIRST_ENTRY, {
          user: displayName,
          type,
          score,
        }),
      );
    } else {
      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.ADD, {
          user: displayName,
          score,
          type,
          total: newScore,
        }),
      );
    }

    // 🔥 Notification prise de première place
    if (
      newLeader &&
      previousLeader &&
      newLeader.user_id === userId &&
      previousLeader.user_id !== userId
    ) {
      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.FIRST_PLACE, {
          user: displayName,
          previousLeader: previousLeader.name,
          type,
        }),
      );
    }

    // 🔹 5️⃣ Réponse API
    res.json({
      users: updatedLeaderboard.map((row) => ({
        userId: row.user_id,
        name: row.name,
        score: row.score,
        rank: row.rank,
      })),
      start: updatedLeaderboard[0]?.start_date ?? null,
      end: updatedLeaderboard[0]?.end_date ?? null,
      type,
    });
  } catch (err) {
    console.error("Error in /points/add:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
