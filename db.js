const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

// Test the connection
db.query("SELECT 1")
  .then(() => console.log("Connected to the auth-service database successfully!"))
  .catch((err) => console.error("Database connection failed:", err.message));

module.exports = db;
