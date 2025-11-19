import { Server, Socket } from "socket.io";
import chatSocketHandler from "./chat.socket.js";
import messageSocketHandler from "./message.socket.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    chatSocketHandler(io, socket);

    messageSocketHandler(io, socket);


    socket.on("typing", ({ chatId, user }) => {
      socket.in(chatId).emit("typing", { user });
    });

    socket.on("stop_typing", ({ chatId, user }) => {
      socket.to(chatId).emit("stop_typing", { user });
    });
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
