const express = require("express");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { sendWelcomeEmail } = require("../Utils/mailer");
// const {redisClient} = require('../Utils/redisClient');
const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("Hit register endpoint...");
  const { name, email, password, profile_picture, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).send("Name, email, password, and role are required");
  }

  if (role !== "student" && role !== "teacher") {
    return res.status(400).send("Role must be either 'student' or 'teacher'");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("CALL sp_register_user(?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      profile_picture || null,
      role,
    ]);
    await sendWelcomeEmail(email, name);
    res.status(201).send("User registered successfully");
  } catch (error) {
    if (error.message.includes("Email already exists")) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send("Database error: " + error.message);
    }
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const [resultSets] = await db.query("CALL login(?)", [email]);
    const user = resultSets[0][0];
    if (
      !user ||
      !user.password ||
      !bcrypt.compareSync(password, user.password)
    ) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).send("Database error: " + error.message);
  }
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Token is required");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Invalid or expired token");
    req.user = decoded;
    next();
  });
};

router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!user || user.length === 0) {
      return res.status(404).send("User not found");
    }
    return res.json(user[0]);
  } catch (error) {
    console.error("Auth service error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = { router, authenticate };
