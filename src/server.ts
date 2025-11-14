import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app.js";
import { createRedisAdapter } from "./config/redis.js";
import conntectDB from "./config/db.js";

export let io: Server

const PORT = process.env.PORT || 5000

async function start() {
  await conntectDB();

  const server = http.createServer(app)

  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  })

  await createRedisAdapter(io)

  io.on("connection", (socket: Socket) => {
    console.log("✅ Socket connected:", socket.id)

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`👥 User joined chat: ${chatId}`);
    })

    socket.on(
      "new_message",
      (messageData: { chat: { _id: string } | string; [key: string]: any }) => {
        const chatId =
          typeof messageData.chat === "string"
            ? messageData.chat
            : messageData.chat._id;

        socket.to(chatId).emit("message_received", messageData);
      }
    )

    socket.on("typing", (chatId: string) => {
      socket.in(chatId).emit("typing");
    })

    socket.on("stop_typing", (chatId: string) => {
      socket.in(chatId).emit("stop_typing")
    })

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id)
    })
  })

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

start();
