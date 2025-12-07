import { Server, Socket } from "socket.io";
import { markMessageAsRead } from "../modules/message/message.service.js";

export default function messageSocketHandler(io: Server, socket: Socket) {

/*   socket.on("message_sent", ({ chatId, message }) => {
    console.log(`📨 Message broadcast → chat: ${chatId} | messageId: ${message._id}`);
    io.to(chatId).emit("message_received", message);
  }); */

  socket.on("mark_as_read", async ({ messageId }) => {
    try {
      const userId = (socket as any).user.id; 

      console.log(`👁️ Marking as read → messageId: ${messageId} | user: ${userId}`);

      const updatedMessage = await markMessageAsRead(messageId, userId);

      const chatId = updatedMessage.chat.toString();

      io.to(chatId).emit("message_read", updatedMessage);

    } catch (error) {
      console.error("❌ Error in mark_as_read:", error);
    }
  });
}
