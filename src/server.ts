import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app.js";
import { createRedisAdapter } from "./config/redis.js";
import conntectDB from "./config/db.js";

export let io : Server; // 👈 dışa aktarılacak global io referansı

const PORT = process.env.PORT || 5000;

async function start() {
  await conntectDB();

  const server = http.createServer(app);

  // 🔌 Socket.IO kur
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Redis adapter bağla (eğer aktif kullanacaksan)
  await createRedisAdapter(io);

  io.on("connection", (socket : Socket) => {
    console.log("✅ Socket connected:", socket.id);

    // 🔹 Kullanıcı chat odasına katılır
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`👥 User joined chat: ${chatId}`);
    });

    // 🔹 Yeni mesaj alındığında odaya yay
    socket.on("new_message", (messageData) => {
      const chatId = messageData.chat._id || messageData.chat;
      socket.to(chatId).emit("message_received", messageData);
    });

    // 🔹 Kullanıcı çıkarsa logla
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  // Sunucuyu başlat
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
