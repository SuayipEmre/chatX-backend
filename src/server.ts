// src/server.ts
import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app.js";
import { createClient } from "redis";
import connectDB from "./config/db.js";

export let io: Server;

// Redis
const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

const PORT = process.env.PORT || 8080;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log("✅ Socket connected:", socket.id, "user:", userId);

    // ONLINE
    if (userId) {
      await redis.hSet("online_users", userId, Date.now().toString());
      await redis.hDel("last_seen", userId);
      io.emit("user_online", userId);
    }

    // SOHBET ODASINA KATIL
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`👥 User joined chat: ${chatId}`);
    });

    // MESAJ YAYINI
    socket.on(
      "new_message",
      (data: { chatId: string; content: string; senderId: string }) => {
        console.log("📨 new_message received:", data);

        if (!data || !data.chatId) return;

        // Odaya mesaj yay
        io.to(data.chatId).emit("message_received", data);
      }
    );

    // TYPING
    socket.on("typing", (chatId: string) => {
      socket.to(chatId).emit("typing");
    });

    socket.on("stop_typing", (chatId: string) => {
      socket.to(chatId).emit("stop_typing");
    });

    // OFFLINE
    socket.on("disconnect", async () => {
      if (userId) {
        await redis.hDel("online_users", userId);
        await redis.hSet("last_seen", userId, Date.now().toString());

        io.emit("user_offline", {
          userId,
          lastSeen: Date.now(),
        });
      }

      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

start();
