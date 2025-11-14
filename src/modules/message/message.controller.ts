import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import Message from "./message.model.js";
import Chat from "../chat/chat.model.js";
import { io } from "../../server.js"; // 👈 ekledik

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private
 */

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  const senderId = (req as any).user.id;

  console.log("sendMessage called with:", { content, chatId, senderId });
  
  if (!content || !chatId) throw new ApiError(400, "Content and chatId are required");

  // 1️⃣ Mesajı oluştur
  let message = await Message.create({
    sender: senderId,
    content,
    chat: chatId,
  });

  // 2️⃣ populate ile ilişkili verileri getir
  message = await message.populate([
    { path: "sender", select: "username email avatar" },
    { path: "chat" },
  ]);

  // 3️⃣ Chat’in son mesajını güncelle
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  // 4️⃣ 💥 Socket.IO yayını yap (chatId odasındaki herkese)
  io.to(chatId).emit("message_received", message);

  // 5️⃣ API cevabını döndür
  sendResponse(res, 201, "Message sent successfully", message);
});

/**
 * @desc    Get all messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  if (!chatId) throw new ApiError(400, "Chat ID is required");

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username email avatar")
    .populate("chat")
    .sort({ createdAt: 1 }) // en eski -> en yeni
    .lean();

  sendResponse(res, 200, "Messages fetched successfully", messages);
});
