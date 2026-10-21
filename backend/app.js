const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messages");

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Health check.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Connectly API is running",
  });
});

// Database connection check.
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");

    res.json({
      success: true,
      message: "PostgreSQL connected!",
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error("Database test failed:", error.message);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);

// Handle invalid JSON and upload errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Profile pictures must be 2 MB or smaller.",
    });
  }

  if (error instanceof Error && error.message.startsWith("Only JPEG")) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Unhandled request error:", error.message);
  return res.status(500).json({ message: "Internal server error." });
});

module.exports = app;