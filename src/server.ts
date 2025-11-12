import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { createRedisAdapter } from "./config/redis.js";
import conntectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

async function start() {
  // Mongo
  await conntectDB();

  // HTTP server
  const server = http.createServer(app);

  // Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Redis adapter (pub/sub)
  await createRedisAdapter(io);

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
