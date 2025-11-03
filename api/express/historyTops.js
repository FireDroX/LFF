const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 GET /leaderboard/history
router.get("/", async (_, res) => {
  try {
    const now = new Date();

    // Récupère tous les tops SAUF celui en cours
    const { data: allTops, error } = await supabase
      .from("tops")
      .select("*")
      .order("start_date", { ascending: false }); // les plus récents d’abord

    if (error) {
      console.error("Erreur lors de la récupération des tops :", error);
      return res.status(500).json({ error: "Erreur de récupération des tops" });
    }

    // Filtrage : on garde tout sauf le top en cours
    const history = allTops.filter((top) => {
      const start = new Date(top.start_date);
      const end = new Date(top.end_date);
      // ✅ Si la date actuelle n'est PAS entre start et end → on garde
      return !(now >= start && now <= end);
    });

    res.json(history);
  } catch (err) {
    console.error("Erreur dans /leaderboard/history", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
