const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 🔹 GET /leaderboard/history
router.get("/", async (_, res) => {
  try {
    const now = new Date();

    // Récupère tous les tops SAUF celui en cours
    const { data, error } = await supabase.rpc("get_leaderboard_history");

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur récupération history" });
    }

    res.json(data);
  } catch (err) {
    console.error("Erreur dans /leaderboard/history", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
