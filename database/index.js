const fs = require("node:fs/promises");
const path = require("node:path");
const mysql = require("mysql2/promise");
const runMigrations = require("./migrations");

let pool;

function getConfig() {
  const required = [
    "SQL_SERVER",
    "SQL_PORT",
    "SQL_DBNAME",
    "SQL_USER",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing MySQL environment variables: ${missing.join(", ")}`,
    );
  }

  const port = Number(process.env.SQL_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SQL_PORT must be a valid TCP port");
  }

  return {
    host: process.env.SQL_SERVER,
    port,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD || "",
    database: process.env.SQL_DBNAME,
  };
}

function escapeIdentifier(identifier) {
  return `\`${String(identifier).replaceAll("`", "``")}\``;
}

function getPool() {
  if (!pool) {
    const config = getConfig();
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: Number(process.env.SQL_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "Z",
    });
  }

  return pool;
}

async function initializeDatabase() {
  const config = getConfig();
  const bootstrapConnection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: "utf8mb4",
    timezone: "Z",
  });

  try {
    await bootstrapConnection.query(
      `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(config.database)}
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await bootstrapConnection.end();
  }

  const schema = await fs.readFile(
    path.join(__dirname, "schema.sql"),
    "utf8",
  );
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await getPool().query(statement);
  }

  await runMigrations(getPool());
  await getPool().query("SELECT 1");
}

async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  closeDatabase,
  getPool,
  initializeDatabase,
};
