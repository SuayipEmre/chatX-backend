import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { io } from "../../server.js";
import { createMessage, getMessagesByChat, markMessageAsRead } from "./message.service.js";
import { getUserSocket } from "../../socket/redis.socket.js";


export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  const senderId = (req as any).user.id;

  if (!content || !chatId)
    throw new ApiError(400, "Content and chatId are required");

  const message = await createMessage(senderId, content, chatId);

  io.to(chatId).emit("message_received", message);

  const chat = message.chat as any;
  const users = chat.users.map((u : any) => u.toString());

  const receiverId = users.find((id: string) => id !== senderId);
  console.log('sended message to chat:', chatId, 'from user:', senderId, 'to user:', receiverId);
  
  if (receiverId) {
    const receiverSocket = await getUserSocket(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit("new_message_dm", message);
    } else {
      console.log("📲 Kullanıcı offline → Push gönderilecek");
    }
  }

  sendResponse(res, 201, "Message sent successfully", message);
});
export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  if (!chatId) throw new ApiError(400, "Chat ID is required");

  const messages = await getMessagesByChat(chatId)
  sendResponse(res, 200, "Messages fetched successfully", messages);
});


export const markAsReadController = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { messageId } = req.body

  if (!messageId) throw new ApiError(400, "messageId is required")

  const message = await markMessageAsRead(messageId, userId)

  const chatId = message.chat?._id?.toString() || message.chat?.toString();

  req.app.get("io").to(chatId).emit("message_read", {
    messageId,
    userId,
  });

  sendResponse(res, 200, "Message marked as read", message)
})