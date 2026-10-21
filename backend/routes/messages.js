const express = require("express");
const pool = require("../db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.use(authenticate);

// Get conversation history.
router.get("/:userId", async (req, res) => {
  try {
    const otherId = Number(req.params.userId);

    if (
      !Number.isSafeInteger(otherId) ||
      otherId < 1 ||
      otherId === Number(req.user.id)
    ) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC
       LIMIT 500`,
      [req.user.id, otherId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch messages failed:", error.message);
    res.status(500).json({ message: "Could not fetch messages." });
  }
});

// Save and broadcast a message.
router.post("/", async (req, res) => {
  try {
    const receiverId = Number(req.body.receiverId);
    const content = String(req.body.content || "").trim();

    if (
      !Number.isSafeInteger(receiverId) ||
      receiverId < 1 ||
      receiverId === Number(req.user.id)
    ) {
      return res.status(400).json({ message: "Invalid recipient." });
    }

    if (!content || content.length > 4000) {
      return res.status(400).json({
        message: "Message must contain 1–4000 characters.",
      });
    }

    const recipient = await pool.query(
      `SELECT id FROM users
       WHERE id = $1 AND is_verified = TRUE`,
      [receiverId]
    );

    if (!recipient.rows.length) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, receiver_id, content, created_at`,
      [req.user.id, receiverId, content]
    );

    const message = result.rows[0];
    const io = req.app.get("io");

    io.to(`user:${req.user.id}`).emit("new_message", message);
    io.to(`user:${receiverId}`).emit("new_message", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message failed:", error.message);
    res.status(500).json({ message: "Could not send message." });
  }
});

module.exports = router;