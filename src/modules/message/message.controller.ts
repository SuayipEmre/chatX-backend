import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { io } from "../../server.js"; 
import { createMessage, getMessagesByChat } from "./message.service.js";


export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  const senderId = (req as any).user.id;

  console.log("sendMessage called with:", { content, chatId, senderId });
  
  if (!content || !chatId) throw new ApiError(400, "Content and chatId are required");

 
  const message = await createMessage(senderId, content, chatId);

  io.to(chatId).emit("message_received", message);

  sendResponse(res, 201, "Message sent successfully", message);
});

export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  if (!chatId) throw new ApiError(400, "Chat ID is required");

 const messages = await getMessagesByChat(chatId)
  sendResponse(res, 200, "Messages fetched successfully", messages);
});
