const express = require("express");
const pool = require("../db");
const authenticate = require("../middleware/authenticate");
const { safeUser } = require("../utils/authUtils");

const router = express.Router();

router.use(authenticate);

// List other verified users.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE id <> $1 AND is_verified = TRUE
       ORDER BY name`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch users failed:", error.message);
    res.status(500).json({ message: "Could not fetch users." });
  }
});

// Get the signed-in user's details.
router.get("/me", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE id = $1 AND is_verified = TRUE`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({ user: safeUser(result.rows[0]) });
  } catch (error) {
    console.error("Profile lookup failed:", error.message);
    res.status(500).json({ message: "Could not load profile." });
  }
});

// View another user's public profile.
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const result = await pool.query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE id = $1 AND is_verified = TRUE`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user: safeUser(result.rows[0]) });
  } catch (error) {
    console.error("User profile lookup failed:", error.message);
    res.status(500).json({ message: "Could not load user profile." });
  }
});

module.exports = router;