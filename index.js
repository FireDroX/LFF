require("dotenv/config");

const path = require("node:path");
const cors = require("cors");
const express = require("express");
const { verifyKeyMiddleware } = require("discord-interactions");

const interactionsHandler = require("./api/discord");
const routes = require("./api/express");
const { initializeDatabase } = require("./database");
const getPublicUrl = require("./utils/publicUrl");

const app = express();
const clientDirectory = path.join(__dirname, "client", "dist");
const allowedOrigins = new Set([
  getPublicUrl(),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.set("trust proxy", 1);

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.DISCORD_CLIENT_PUBLIC_KEY),
  interactionsHandler,
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);
app.use(express.json());
app.use(routes);
app.use(express.static(clientDirectory));
app.use((req, res, next) => {
  if (req.method !== "GET" || !req.accepts("html")) {
    return next();
  }
  return res.sendFile(path.join(clientDirectory, "index.html"));
});

const port = Number(process.env.PORT) || 3001;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log(`Public URL: ${getPublicUrl()}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
  });
