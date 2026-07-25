const express = require("express");
const { getPool } = require("../../database");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    await getPool().query("SELECT 1");
    return res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    return res
      .status(503)
      .json({ status: "error", database: "disconnected" });
  }
});

module.exports = router;
