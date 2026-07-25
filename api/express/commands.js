const express = require("express");
const { publicCommands } = require("../discord/registerCommands");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ commands: publicCommands });
});

module.exports = router;
