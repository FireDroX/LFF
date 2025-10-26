const fetch = require("node-fetch");
const express = require("express");
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, FRONTEND_URL } = process.env;

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const tokenResponseData = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          code: req.body.code,
          grant_type: "authorization_code",
          redirect_uri: FRONTEND_URL,
          scope: "identify",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!tokenResponseData.ok) {
      return res.status(tokenResponseData.status).json({
        error: "Failed to fetch token",
        details: await tokenResponseData.text(),
      });
    }

    const oauthData = await tokenResponseData.json();
    return res.json(oauthData);
  } catch (err) {
    console.error("Error in /get/token:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
