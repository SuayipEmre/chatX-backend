import { Request, Response } from "express";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import Chat from "./chat.model.js";

/**
 * @desc  Access or create a one-to-one chat between two users
 * @route POST /api/chats
 * @access Private
 */
export const accessChat = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const currentUserId = (req as any).user.id;

  if (!userId) throw new ApiError(400, "User ID is required");

  // 1️⃣ Mevcut chat var mı kontrol et (iki kullanıcı arasında)
  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [currentUserId, userId] },
  })
    .populate("users", "-password -refreshToken")
    .populate("latestMessage");

  // 2️⃣ Yoksa yeni chat oluştur
  if (!chat) {
    const newChat = await Chat.create({
      chatName: "direct_chat",
      isGroupChat: false,
      users: [currentUserId, userId],
    });

    chat = await Chat.findById(newChat._id)
      .populate("users", "-password -refreshToken")
      .populate("latestMessage");
  }

  sendResponse(res, 200, "Chat accessed successfully", chat);
});

/**
 * @desc  Fetch all chats for the logged-in user
 * @route GET /api/chats
 * @access Private
 */

export const fetchChats = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as any).user.id;

  const chats = await Chat.find({
    users: { $elemMatch: { $eq: currentUserId } }
  })
    .populate("users", "-password -refreshToken")
    .populate("groupAdmin", "-password -refreshToken")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "username email avatar" // frontend için yeterli
      }
    })
    .sort({ updatedAt: -1 })
    .lean();

  sendResponse(res, 200, "Chats fetched successfully", chats);
});


/**
 * @desc    Create a new group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
export const createGroupChat = catchAsync(async (req: Request, res: Response) => {
  const { chatName, users } = req.body;
  const currentUserId = (req as any).user.id;

  if (!chatName || !users)
    throw new ApiError(400, "chatName and users are required");

  let members: string[] = users;

  if (!Array.isArray(members))
    throw new ApiError(400, "Users must be an array");

  if (members.length < 2)
    throw new ApiError(400, "At least 2 users are required to form a group");

  
  if (!members.includes(currentUserId)) {
    members.push(currentUserId);
  }

  const groupChat = await Chat.create({
    chatName,
    isGroupChat: true,
    users: members,
    groupAdmin: currentUserId,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "-password -refreshToken")
    .populate("groupAdmin", "-password -refreshToken");

  sendResponse(res, 201, "Group chat created", fullGroupChat);
});