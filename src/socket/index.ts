import { Server, Socket } from "socket.io";
import chatSocketHandler from "./chat.socket.js";
import messageSocketHandler from "./message.socket.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    // chat room events
    chatSocketHandler(io, socket);

    // message events
    messageSocketHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
