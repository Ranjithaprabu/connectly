
const express = require("express");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const pool = require("../db");
const { makeToken, safeUser } = require("../utils/authUtils");

const router = express.Router();

// Register without email OTP verification.
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        message: "Name must contain 2–100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must contain 8–72 characters.",
      });
    }

    // Check whether this email is already registered.
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    // Hash the password before saving it.
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
         (name, email, password_hash, is_verified,
          otp_hash, otp_expires_at)
       VALUES ($1, $2, $3, TRUE, NULL, NULL)
       RETURNING id, name, email, avatar_url`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
      token: makeToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    // Handle duplicate registrations, including simultaneous requests.
    if (error.code === "23505") {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    console.error("Registration failed:", error.message);

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
});

// Login.
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const result = await pool.query(
      `SELECT id, name, email, avatar_url, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (
      !user ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.json({
      message: "Login successful.",
      token: makeToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

// Get the currently authenticated user's profile.
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        message: "Account not found.",
      });
    }

    return res.json({
      user: safeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Profile lookup failed:", error.message);

    return res.status(500).json({
      message: "Could not load profile.",
    });
  }
});

module.exports = router;
