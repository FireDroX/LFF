const express = require("express");

const getPublicUrl = require("../../utils/publicUrl");

const router = express.Router();

router.get("/", (_req, res) => {
  return res.json({
    discordClientId: process.env.DISCORD_CLIENT_ID,
    publicUrl: getPublicUrl(),
  });
});

module.exports = router;
