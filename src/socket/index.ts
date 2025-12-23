import { Server, Socket } from "socket.io";
import chatSocketHandler from "./chat.socket.js";
import messageSocketHandler from "./message.socket.js";
import { removeUserOnline, setUserOnline } from "./redis.socket.js";
import User from "../modules/user/user.model.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    const userId = socket.handshake.auth.userId as string;

    chatSocketHandler(io, socket);
    messageSocketHandler(io, socket);

    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          lastSeenAt: null,
        });

        await setUserOnline(userId, socket.id);

        socket.broadcast.emit("user_online", userId);
      console.log("User online setup completed for userId:", userId);
      } catch (err) {
        console.error("User online setup failed:", err);
      }
    }

    socket.on("typing", ({ chatId, user }) => {
      socket.in(chatId).emit("typing", { user });
    });

    socket.on("stop_typing", ({ chatId, user }) => {
      socket.to(chatId).emit("stop_typing", { user });
    });

    socket.on("disconnect", async () => {
      if (!userId) return;

      const lastSeenAt = new Date();

      try {
        await User.findByIdAndUpdate(userId, {
          lastSeenAt,
        });

        await removeUserOnline(userId);

        socket.broadcast.emit("user_offline", {
          userId,
          lastSeenAt,
        });
        console.log("User offline cleanup completed for userId:", userId);
        
      } catch (err) {
        console.error("User offline cleanup failed:", err);
      }
    });
  });
};
