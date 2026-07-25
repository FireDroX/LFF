const express = require("express");
const getPublicUrl = require("../../utils/publicUrl");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const allowedRedirectUris = new Set([
      getPublicUrl(),
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]);
    const redirectUri = allowedRedirectUris.has(req.body?.redirectUri)
      ? req.body.redirectUri
      : getPublicUrl();

    const tokenResponseData = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          code: req.body.code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "identify",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
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
