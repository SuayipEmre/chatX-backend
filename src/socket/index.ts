import { Server, Socket } from "socket.io";
import chatSocketHandler from "./chat.socket.js";
import messageSocketHandler from "./message.socket.js";
import { removeUserOnline, setUserOnline } from "./redis.socket.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);
    const userId = socket.handshake.auth.userId as string;

    chatSocketHandler(io, socket);
    console.log("🔥 SOCKET CONNECT USER:", userId);
    messageSocketHandler(io, socket);
    

    if(userId) {
      setUserOnline(userId, socket.id)
      socket.broadcast.emit("user_online", userId)
    };
    socket.on("typing", ({ chatId, user }) => {
      socket.in(chatId).emit("typing", { user });
    });

    socket.on("stop_typing", ({ chatId, user }) => {
      socket.to(chatId).emit("stop_typing", { user });
    });
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      if (userId) {
        removeUserOnline(userId);
        socket.broadcast.emit("user_offline", userId);
      }
    });
  });
};
