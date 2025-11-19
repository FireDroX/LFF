const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Route : /points/add/:type
 * Exemple : /points/add/crystaux, /iscoin, /dragonegg, /beacon ou /sponge
 */

router.post("/:type", checkAuth, async (req, res) => {
  const { type } = req.params;

  // Vérification du type demandé
  if (
    !["crystaux", "iscoin", "dragonegg", "beacon", "sponge", "pvp"].includes(
      type
    )
  ) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const now = new Date();

  try {
    const score = req.body.score;
    const username = req.user.username;
    const userId = req.user.id;

    if (!username || typeof score !== "number") {
      return res.status(400).json({ error: "username and points required" });
    }

    let { data: currentTop, error } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .or(
        `and(start_date.lte.${now.toISOString()},end_date.gte.${now.toISOString()}),and(start_date.is.null,end_date.is.null)`
      )
      .single();

    if (error) {
      console.log("Aucun top trouvé.");
      return res.status(500).json({ error: "Aucun top trouvé." });
    }

    let users = currentTop.users || [];
    // ✅ Top 1 avant modification
    const previousSorted = [...users].sort((a, b) => b.score - a.score);
    const previousLeader = previousSorted[0]?.name || null;

    let totalScore;
    const userIndex = users.findIndex((u) => u.name === username);

    if (userIndex >= 0) {
      users[userIndex].score += score;

      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.ADD, {
          user: req.user.username,
          score,
          type,
          total: users[userIndex].score,
        })
      );
    } else {
      users.push({ name: username, score, userId });

      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.FIRST_ENTRY, {
          user: req.user.username,
          type,
          score,
        })
      );
    }

    const { error: updateError } = await supabase
      .from("tops")
      .update({ users })
      .eq("id", currentTop.id);

    if (updateError) {
      console.error("Erreur update top:", updateError);
      return res
        .status(500)
        .json({ error: "Impossible de mettre à jour le classement" });
    }

    const sorted = users.sort((a, b) => b.score - a.score);

    // ✅ Top 1 après modification
    const newLeader = sorted[0]?.name || null;

    // ✅ Notification prise de première place
    if (
      newLeader === username &&
      previousLeader &&
      previousLeader !== username
    ) {
      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.FIRST_PLACE, {
          user: username,
          previousLeader,
          type,
        })
      );
    }

    const top5 = sorted.slice(0, 5);

    const filled = [
      ...top5,
      ...Array(5 - top5.length)
        .fill()
        .map(() => ({ score: 0, name: "Nobody" })),
    ];

    res.json({
      users: filled,
      start: currentTop.start_date,
      end: currentTop.end_date,
      type: currentTop.type,
    });
  } catch (err) {
    console.error("Error in /points/add", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
