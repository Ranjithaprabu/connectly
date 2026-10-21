
const express = require("express");
const fs = require("fs");
const pool = require("../db");
const authenticate = require("../middleware/authenticate");
const { uploadAvatar } = require("../config/upload");

const router = express.Router();

// Upload or change profile picture.
router.post(
  "/avatar/upload",
  authenticate,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    let avatarPath;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image.",
        });
      }

      avatarPath = req.file.path;

      const avatarUrl = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `UPDATE users
         SET avatar_url = $1
         WHERE id = $2
         RETURNING id, name, email, avatar_url`,
        [avatarUrl, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      return res.status(200).json({
        message: "Profile picture uploaded successfully.",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Avatar upload failed:", error);

      return res.status(500).json({
        message: "Could not upload profile picture.",
      });
    }
  }
);

// Remove profile picture.
router.delete("/avatar", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET avatar_url = NULL
       WHERE id = $1
       RETURNING id, name, email, avatar_url`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile picture removed successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Avatar removal failed:", error);

    return res.status(500).json({
      message: "Could not remove profile picture.",
    });
  }
});

module.exports = router;
