require("dotenv/config");

const fs = require("node:fs");
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
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = new Set([
  getPublicUrl(),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]);

function validateClientBuild() {
  const indexPath = path.join(clientDirectory, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      "Vite build not found. Run `npm run build` before starting the server.",
    );
  }

  const html = fs.readFileSync(indexPath, "utf8");
  const assetReferences = [
    ...html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g),
  ].map((match) => match[1]);
  const missingAssets = assetReferences.filter(
    (asset) => !fs.existsSync(path.join(clientDirectory, asset)),
  );

  if (missingAssets.length > 0) {
    throw new Error(
      `Incomplete Vite build. Missing assets: ${missingAssets.join(", ")}`,
    );
  }
}

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
app.use("/healthz", require("./api/express/healthz"));
app.use("/api", routes);
app.use(
  "/assets",
  express.static(path.join(clientDirectory, "assets"), {
    immutable: true,
    maxAge: "1y",
  }),
  (_req, res) => res.status(404).json({ error: "Static asset not found" }),
);
app.use(
  express.static(clientDirectory, {
    setHeaders(res, filePath) {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);
app.use((req, res, next) => {
  if (req.method !== "GET" || !req.accepts("html")) {
    return next();
  }
  if (path.extname(req.path)) {
    return res.status(404).json({ error: "Static asset not found" });
  }
  return res.sendFile(path.join(clientDirectory, "index.html"));
});

initializeDatabase()
  .then(() => {
    validateClientBuild();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log(`Public URL: ${getPublicUrl()}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
  });
