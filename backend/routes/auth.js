const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const pool = require("../db");
const { deliverOtp } = require("../config/mailer");
const { makeToken, safeUser, hashOtp } = require("../utils/authUtils");

const router = express.Router();

// Register and send verification OTP.
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

    const existing = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows[0]?.is_verified) {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existing.rows.length) {
      await pool.query(
        `UPDATE users
         SET name = $1, password_hash = $2,
             otp_hash = $3, otp_expires_at = $4
         WHERE email = $5`,
        [name, passwordHash, hashOtp(otp), otpExpires, email]
      );
    } else {
      await pool.query(
        `INSERT INTO users
           (name, email, password_hash, is_verified,
            otp_hash, otp_expires_at)
         VALUES ($1, $2, $3, FALSE, $4, $5)`,
        [name, email, passwordHash, hashOtp(otp), otpExpires]
      );
    }

    try {
      await deliverOtp(email, otp);
    } catch (error) {
      console.error("Email delivery failed:", error.message);

      return res.status(500).json({
        message: "Could not send verification email. Check SMTP settings.",
      });
    }

    return res.status(201).json({
      message: "OTP sent. Check your email to verify your account.",
      email,
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res.status(500).json({ message: "Registration failed." });
  }
});

// Verify OTP and log in.
router.post("/verify-otp", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Enter the 6-digit OTP.",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, avatar_url, otp_hash, otp_expires_at
       FROM users
       WHERE email = $1 AND is_verified = FALSE`,
      [email]
    );

    const user = result.rows[0];

    if (
      !user ||
      !user.otp_hash ||
      !user.otp_expires_at ||
      new Date(user.otp_expires_at).getTime() < Date.now() ||
      hashOtp(otp) !== user.otp_hash
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please register again.",
      });
    }

    const verified = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, otp_hash = NULL, otp_expires_at = NULL
       WHERE id = $1
       RETURNING id, name, email, avatar_url`,
      [user.id]
    );

    const verifiedUser = verified.rows[0];

    return res.json({
      message: "Email verified successfully.",
      token: makeToken(verifiedUser),
      user: safeUser(verifiedUser),
    });
  } catch (error) {
    console.error("OTP verification failed:", error.message);
    return res.status(500).json({
      message: "OTP verification failed.",
    });
  }
});

// Login.
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const result = await pool.query(
      `SELECT id, name, email, avatar_url,
              password_hash, is_verified
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

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    return res.json({
      message: "Login successful.",
      token: makeToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, avatar_url
         FROM users
         WHERE id = $1 AND is_verified = TRUE`,
        [req.user.id]
      );
  
      if (!result.rows.length) {
        return res.status(401).json({
          message: "Account not found.",
        });
      }
  
      res.json({ user: safeUser(result.rows[0]) });
    } catch (error) {
      console.error("Profile lookup failed:", error.message);
  
      res.status(500).json({
        message: "Could not load profile.",
      });
    }
  });

module.exports = router;