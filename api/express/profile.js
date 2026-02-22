const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const checkAuth = require("../../utils/checkAuth");
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 💰 Poids de conversion des points en "money"
const VALUE_WEIGHTS = {
  crystaux: 2_000_000_000, // 2B (environ 3 crystaux par cr blanc)
  pvp: 500_000_000, // 500M
  iscoin: 2_000_000, // 2M
  dragonegg: 1_500_000_000, // 1.5B
  beacon: 150_000_000, // 150M
  sponge: 15_000_000, // 15M
};

router.get("/", checkAuth, async (req, res) => {
  const { id } = req.user;

  const { data, error } = await supabase
    .from("top_rankings")
    .select(
      `
      score,
      tops ( type )
    `,
    )
    .eq("user_id", id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur récupération scores" });
  }

  const totals = {
    crystaux: 0,
    pvp: 0,
    iscoin: 0,
    dragonegg: 0,
    beacon: 0,
    sponge: 0,
  };

  for (const row of data || []) {
    const type = row.tops?.type;
    const weight = VALUE_WEIGHTS[type] || 1;

    if (type) {
      totals[type] += row.score * weight;
    }
  }

  res.json({ totals });
});

module.exports = router;
