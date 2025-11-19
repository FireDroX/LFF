const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const checkAuth = require("../../utils/checkAuth");
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 💰 Poids de conversion des points en "money"
const VALUE_WEIGHTS = {
  crystaux: 1_000_000_000, // 1B
  pvp: 500_000_000, // 500M
  iscoin: 2_000_000, // 2M
  dragonegg: 1_500_000_000, // 1.5B
  beacon: 150_000_000, // 150M
  sponge: 15_000_000, // 15M
};

router.get("/", checkAuth, async (req, res) => {
  const { id } = req.user;

  // Récupère les scores dans chaque top
  const { data: tops } = await supabase.from("tops").select("type, users");

  const totals = {
    crystaux: 0,
    pvp: 0,
    iscoin: 0,
    dragonegg: 0,
    beacon: 0,
    sponge: 0,
  };

  for (const top of tops || []) {
    const player = top.users?.find((u) => u.userId === id);
    if (player) {
      const weight = VALUE_WEIGHTS[top.type] || 1;
      totals[top.type] += player.score * weight;
    }
  }

  res.json({
    totals,
  });
});

module.exports = router;
