const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const checkAuth = require("../../utils/checkAuth");
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/", checkAuth, async (req, res) => {
  const { id } = req.user;

  // Récupère les scores dans chaque top
  const { data: tops } = await supabase.from("tops").select("type, users");

  const totals = {
    crystaux: 0,
    iscoin: 0,
    dragonegg: 0,
    beacon: 0,
    sponge: 0,
  };

  for (const top of tops || []) {
    const player = top.users?.find((u) => u.userId === id);
    if (player) totals[top.type] += player.score;
  }

  res.json({
    totals,
  });
});

module.exports = router;
