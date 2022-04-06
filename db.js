const mysql = require("mysql");

const db = mysql.createConnection({
  host: "34.216.97.209",
  port: 3306,
  database: "cgs_app",
  user: "aziel",
  password: "5157",
});

module.exports = db;
