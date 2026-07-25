const express = require("express");

const { getPool } = require("../../database");
const checkAuth = require("../../utils/checkAuth");

const router = express.Router();

const VALUE_WEIGHTS = {
  crystaux: 2_000_000_000,
  pvp: 500_000_000,
  iscoin: 2_000_000,
  dragonegg: 1_500_000_000,
  beacon: 150_000_000,
  sponge: 15_000_000,
};

router.get("/", checkAuth, async (req, res) => {
  try {
    const [rows] = await getPool().execute(
      `SELECT t.type, SUM(r.score) AS score
       FROM top_rankings AS r
       INNER JOIN tops AS t ON t.id = r.top_id
       WHERE r.user_id = ?
       GROUP BY t.type`,
      [req.user.id],
    );

    const totals = Object.fromEntries(
      Object.keys(VALUE_WEIGHTS).map((type) => [type, 0]),
    );

    for (const row of rows) {
      const weightedTotal = Number(row.score) * VALUE_WEIGHTS[row.type];
      totals[row.type] = weightedTotal;
    }

    return res.json({ totals });
  } catch (error) {
    console.error("Profile score retrieval failed:", error);
    return res.status(500).json({ error: "Unable to retrieve scores" });
  }
});

module.exports = router;
