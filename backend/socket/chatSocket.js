const jwt = require("jsonwebtoken");

function configureChatSocket(io) {
  // Authenticate socket connections.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required."));
      }

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid or expired session."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    socket.join(`user:${userId}`);
    console.log(`Authenticated user ${userId} connected.`);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected.`);
    });
  });
}

module.exports = configureChatSocket;