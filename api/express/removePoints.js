const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const checkAuth = require("../../utils/checkAuth");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { getRandomMessage, MESSAGE_SETS } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// DELETE /points/remove/weekly, /isvalue
router.delete("/:type", checkAuth, async (req, res) => {
  const { type } = req.params;

  // Vérification du type demandé
  if (!["weekly", "isvalue"].includes(type)) {
    return res.status(400).json({ error: "Invalid type parameter" });
  }

  const now = new Date();
  try {
    const userId = req.user.id;

    let query = supabase.from("tops").select("*");

    if (type === "weekly") {
      // ⏳ Mode Weekly — tops actifs selon date
      query = query
        .lte("start_date", now.toISOString())
        .gte("end_date", now.toISOString());
    } else if (type === "isvalue") {
      // 🪙 Mode Isvalue — tops par type item
      const isValueTypes = ["dragon_egg", "beacon", "sponge"];
      query = query.in("type", isValueTypes);
    }

    let { data: currentTop, error } = await query;

    if (error || !currentTop) {
      return res
        .status(500)
        .json({ error: "Impossible de récupérer les tops." });
    }

    // Liste des tops à mettre à jour
    const updatedTops = currentTop
      .map((top) => {
        const filteredUsers = (top.users || []).filter(
          (u) => u.userId !== userId
        );

        // Si aucun changement, on skip
        if (filteredUsers.length === top.users.length) return null;

        return {
          id: top.id,
          users: filteredUsers,
        };
      })
      .filter(Boolean); // enlève les null

    // Si rien à modifier
    if (updatedTops.length === 0) {
      return res.json({
        message: "Utilisateur non trouvé dans les classements.",
      });
    }

    // Met à jour les tops un par un
    const updates = await Promise.all(
      updatedTops.map(async (top) => {
        const { error: updateError } = await supabase
          .from("tops")
          .update({ users: top.users })
          .eq("id", top.id);

        if (updateError) {
          console.error(
            `Erreur lors de la mise à jour du top ${top.id}:`,
            updateError
          );
        }
      })
    );

    await sendDiscordLog(
      getRandomMessage(MESSAGE_SETS.REMOVE, {
        user: req.user.username,
        type,
      })
    );

    res.json({
      message: `Utilisateur supprimé des classements (${updatedTops.length} modifiés).`,
    });
  } catch (err) {
    console.error("Erreur dans /points/delete", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
