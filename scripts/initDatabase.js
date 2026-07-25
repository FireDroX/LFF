require("dotenv/config");

const { closeDatabase, initializeDatabase } = require("../database");

initializeDatabase()
  .then(() => {
    console.log("MySQL database and tables are ready.");
  })
  .catch((error) => {
    console.error("MySQL initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
