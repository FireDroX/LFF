// index.js
require("dotenv/config");

const interactionsHandler = require("./api/discord/index");
const { verifyKeyMiddleware } = require("discord-interactions");

const cors = require("cors");
const path = require("node:path");
const express = require("express");

const app = express();

const routes = require("./api/express");

/**
 * /interaction avant express.json() pour eviter le warning:
 * [discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.
 */
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.DISCORD_CLIENT_PUBLIC_KEY),
  interactionsHandler
);

app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "client/build")));
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server listening at port: ${process.env.PORT}`);
});
