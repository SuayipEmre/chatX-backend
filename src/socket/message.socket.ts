import { Server, Socket } from "socket.io";

export default function messageSocketHandler(io: Server, socket: Socket) {

  socket.on("message_sent", ({ chatId, message }) => {
    console.log(`📨 Message broadcast → chat: ${chatId} | messageId: ${message._id}`);
    io.to(chatId).emit("message_received", message);
  });

  socket.on("message_read", ({ chatId, messageId, userId }) => {
    console.log(`👁️ Message read → chat: ${chatId} | messageId: ${messageId} | user: ${userId}`);
    io.to(chatId).emit("message_read", { messageId, userId });
  });
}
