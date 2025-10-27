// index.js

require("dotenv/config");
const cors = require("cors");
const path = require("node:path");
const express = require("express");

const app = express();

const routes = require("./api/express");
app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "client/build")));
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server listening at port: ${process.env.PORT}`);
});
