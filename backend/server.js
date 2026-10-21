require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const pool = require("./db");
const initializeDatabase = require("./initializeDatabase");
const configureChatSocket = require("./socket/chatSocket");

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET ===
    "replace_this_with_a_long_random_secret"
) {
  console.error(
    "Set a private JWT_SECRET in backend/.env before starting."
  );
  process.exit(1);
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO available to message routes.
app.set("io", io);

// Register Socket.IO handlers once.
configureChatSocket(io);

let isShuttingDown = false;

async function startServer() {
  try {
    await initializeDatabase();

    server.listen(PORT, () => {
      console.log(`Connectly API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    await pool.end().catch(() => {});
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  // Prevent duplicate shutdown attempts.
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log(`Shutting down Connectly (${signal})...`);

  // Stop accepting new HTTP connections and close Socket.IO.
  io.close();

  // Close the PostgreSQL pool after the server has stopped.
  try {
    await pool.end();
    console.log("Database connection pool closed.");
  } catch (error) {
    console.error(
      "Error closing database pool:",
      error.message
    );
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();