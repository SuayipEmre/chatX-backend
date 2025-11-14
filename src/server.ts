import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app.js";
import { createClient } from "redis";
import { createRedisAdapter } from "./config/redis.js";
import connectDB from "./config/db.js";

export let io: Server;

// ✅ Redis client
const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
await redisClient.connect();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);
  io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

  await createRedisAdapter(io);

  io.on("connection", async (socket: Socket) => {
    console.log("✅ Socket connected:", socket.id);

    // 🔹 1. Who is the user?
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      await redisClient.hSet("online_users", userId, Date.now().toString());
      console.log(`🟢 User ${userId} is online`)
      io.emit("user_online", userId)
    }

    // 🔹 2. users join chat room
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId)
    })

    // 🔹 3. New message
    socket.on("new_message", (messageData: { chat: { _id: string } | string; [key: string]: any }) => {
      const chatId = typeof messageData.chat === "string" ? messageData.chat : messageData.chat._id
      socket.to(chatId).emit("message_received", messageData)
    })

    //  4. Typing Events
    socket.on("typing", (chatId: string) => socket.in(chatId).emit("typing"))
    socket.on("stop_typing", (chatId: string) => socket.in(chatId).emit("stop_typing"))

    socket.on("disconnect", async () => {
      if (userId) {
        await redisClient.hDel("online_users", userId)
        console.log(`🔴 User ${userId} went offline`)
        io.emit("user_offline", userId)
      }
    })
  })

  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
}

start()
