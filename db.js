const sql = require("mssql");

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: "lff",
  options: {
    trustServerCertificate: true,
  },
};

module.exports = sql.connect(config);
