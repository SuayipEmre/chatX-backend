import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/sendResponse.js";


import { accessChatService, createGroupChatService, fetchChatsService } from "./chat.service.js";

export const accessChat = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const currentUserId = (req as any).user.id;

  
  if (!userId) throw new ApiError(400, "User ID is required");

  const chat = await accessChatService(currentUserId, userId)

  sendResponse(res, 200, "Chat accessed successfully", chat);
});


export const fetchChats = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as any).user.id;

  const chats = await fetchChatsService(currentUserId)

  sendResponse(res, 200, "Chats fetched successfully", chats);
});



export const createGroupChat = catchAsync(async (req: Request, res: Response) => {
  const { chatName, users } = req.body;
  const currentUserId = (req as any).user.id;
  const fullGroupChat = await createGroupChatService(currentUserId, chatName, users);

  sendResponse(res, 201, "Group chat created", fullGroupChat);
});