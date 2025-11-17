import { Server, Socket } from "socket.io";

export default function chatSocketHandler(io: Server, socket: Socket) {
  // kullanıcı bir chat odasına giriyor
  socket.on("join_chat", (chatId: string) => {
    socket.join(chatId);
    console.log(`📥 User joined chat room: ${chatId}`);
  });

  // kullanıcı odadan çıkıyor
  socket.on("leave_chat", (chatId: string) => {
    socket.leave(chatId);
    console.log(`📤 User left chat room: ${chatId}`);
  });
}
