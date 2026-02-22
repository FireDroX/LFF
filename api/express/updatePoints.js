const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { getRandomMessage, MESSAGE_SETS } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_TYPES = [
  "crystaux",
  "pvp",
  "iscoin",
  "dragonegg",
  "beacon",
  "sponge",
];

router.patch("/:type", checkAuth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const type = req.params.type?.toLowerCase();
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid leaderboard type" });
    }

    const { delta, userId, username } = req.body || {};
    const scoreDelta = Number(delta);

    if (!Number.isFinite(scoreDelta) || scoreDelta === 0) {
      return res
        .status(400)
        .json({ error: "A non-zero numeric delta is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const now = new Date().toISOString();

    // 🔹 1️⃣ Récupérer le top actif
    const { data: currentTop, error: topError } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .or(
        `and(start_date.lte.${now},end_date.gte.${now}),and(start_date.is.null,end_date.is.null)`,
      )
      .single();

    if (topError || !currentTop) {
      return res
        .status(500)
        .json({ error: "Impossible de récupérer le classement." });
    }

    // 🔹 2️⃣ Ajustement atomique
    const { data: newTotal, error: adjustError } = await supabase.rpc(
      "staff_adjust_score",
      {
        p_top_id: currentTop.id,
        p_user_id: userId,
        p_delta: scoreDelta,
        p_name: username || "Unknown",
      },
    );

    if (adjustError) {
      console.error("Staff adjust error:", adjustError);
      return res
        .status(500)
        .json({ error: "Impossible de mettre à jour le classement" });
    }

    // 🔹 3️⃣ Récupérer leaderboard mis à jour
    const { data: leaderboard } = await supabase.rpc(
      "get_current_leaderboard",
      { p_type: type },
    );

    // 🔹 4️⃣ Log Discord
    const logMessage = getRandomMessage(
      scoreDelta > 0 ? MESSAGE_SETS.STAFF_ADD : MESSAGE_SETS.STAFF_REMOVE,
      {
        staff: req.user.username,
        target: username || userId,
        score: Math.abs(scoreDelta),
        type,
        total: newTotal,
      },
    );

    await sendDiscordLog(logMessage);

    return res.json({
      users: leaderboard.map((row) => ({
        userId: row.user_id,
        name: row.name,
        score: row.score,
        rank: row.rank,
      })),
      start: leaderboard[0]?.start_date ?? null,
      end: leaderboard[0]?.end_date ?? null,
      type,
    });
  } catch (err) {
    console.error("Error in staff leaderboard adjustment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
