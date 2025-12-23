import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import Chat from "./chat.model.js";


export const accessChatService = async (currentUserId: string, userId: string) => {
    if (!userId) throw new ApiError(400, "User ID is required");

    let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [currentUserId, userId] },
    })
        .populate("users", "username email avatar")
        .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username email avatar" },
        })
        .lean();

    if (!chat) {
        const newChat = await Chat.create({
            chatName: "direct_chat",
            isGroupChat: false,
            users: [currentUserId, userId],
        });

        chat = await Chat.findById(newChat._id)
            .populate("users", "username email avatar")
            .populate({
                path: "latestMessage",
                populate: { path: "sender", select: "username email avatar" },
            })
            .lean();
    }

    if (!chat) throw new ApiError(500, "Failed to fetch or create chat");

    if (!chat.isGroupChat) {
        (chat as any).otherUser = chat.users.find(
            (u: any) => u._id.toString() !== currentUserId
        );
    }

    return chat;
};


export const fetchChatsService = async (currentUserId: string) => {
    const userObjectId = new Types.ObjectId(currentUserId);
  
    let chats = await Chat.find({
      users: { $in: [userObjectId] },  
    })
      .populate("users", "username email avatar lastSeenAt")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username email avatar" },
      })
      .populate({
        path: "group",
        select: "_id groupName",
      })
      .sort({ updatedAt: -1 })
      .lean();
  
      console.log('Fetched chats:', chats);
      chats = chats.map((chat: any) => {
        if (chat.isGroupChat) {
          const rawGroup = chat.group;
      
          chat.groupId =
            rawGroup && typeof rawGroup === "object"
              ? rawGroup._id?.toString?.() ?? rawGroup._id
              : rawGroup?.toString?.() ?? rawGroup ?? null;
      
          chat.groupName =
            rawGroup && typeof rawGroup === "object"
              ? rawGroup.groupName ?? chat.chatName
              : chat.chatName;
        } else {
          chat.otherUser = chat.users.find(
            (u: any) => u._id.toString() !== currentUserId
          );
        }
      
        delete chat.group; 
        return chat;
      });
      
      return chats
  };

export const createGroupChatService = async (
    currentUserId: string,
    chatName: string,
    users: string[]
) => {
    if (!chatName || !users) throw new ApiError(400, "chatName and users are required");
    if (!Array.isArray(users)) throw new ApiError(400, "users must be an array");
    if (users.length < 2) throw new ApiError(400, "At least 2 users are required");

    // Kurucu kullanıcı listeye dahil değilse ekle
    if (!users.includes(currentUserId)) users.push(currentUserId);

    const groupChat = await Chat.create({
        chatName,
        isGroupChat: true,
        users,
        groupAdmin: currentUserId,
    });

    const fullGroup = await Chat.findById(groupChat._id)
        .populate("users", "username email avatar")
        .populate("groupAdmin", "username email avatar")
        .lean();

    return fullGroup;
};
