import { Server, Socket } from "socket.io";

export default function messageSocketHandler(io: Server, socket: Socket) {

  // mesaj gönderildiğinde tüm odadakilere yay
  socket.on("message_sent", ({ chatId, message }) => {
    io.to(chatId).emit("message_received", message);
  });

  // mesaj okundu bildirimi
  socket.on("message_read", ({ chatId, messageId, userId }) => {
    io.to(chatId).emit("message_read", { messageId, userId });
  });
}
