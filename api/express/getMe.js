const fetch = require("node-fetch");
const express = require("express");

const checkAuth = require("../../utils/checkAuth");

const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
  try {
    const authString = req.headers.authorization;
    if (!authString) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    // ✅ 1. Récupérer les infos Discord
    const me = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: authString },
    });

    if (!me.ok) {
      return res
        .status(me.status)
        .json({ error: "Unauthorized or invalid token" });
    }

    const response = await me.json();
    const { id: discordID, global_name, avatar } = response;

    // ✅ 2. Retourner les infos utiles
    const user = {
      id: discordID,
      global_name,
      avatar,
      flags: req.user.flags,
      isAdmin: req.user.isAdmin,
    };
    res.json(user);
  } catch (err) {
    console.error("Error in /get/me:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
