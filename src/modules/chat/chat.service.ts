import { ApiError } from "../../utils/ApiError.js";
import Chat from "./chat.model.js";

export const accessChatService = async (currentUserId: string, userId: string) => {
    if (!userId) throw new ApiError(400, "User ID is required");

    let chatDoc = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [currentUserId, userId] },
    })
        .populate("users", "username email avatar")
        .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username email avatar" },
        });

    if (!chatDoc) {
        const newChat = await Chat.create({
            chatName: "direct_chat",
            isGroupChat: false,
            users: [currentUserId, userId],
        });

        chatDoc = await Chat.findById(newChat._id)
            .populate("users", "username email avatar")
            .populate({
                path: "latestMessage",
                populate: { path: "sender", select: "username email avatar" },
            });
    }

    if (!chatDoc) {
        throw new ApiError(500, "Failed to create or fetch chat");
    }


    const chat: any = chatDoc.toObject();

    if (!chat.isGroupChat) {
        chat.otherUser = chat.users.find(
            (u: any) => u._id.toString() !== currentUserId
        );
    }

    return chat;
};


export const fetchChatsService = async (currentUserId: string) => {
    let chats = await Chat.find({
        users: { $elemMatch: { $eq: currentUserId } }
    })
        .populate("users", "username email avatar")
        .populate("groupAdmin", "username email avatar")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "username email avatar"
            }
        })
        .sort({ updatedAt: -1 })
        .lean();

    // 🔥 DM (one-to-one chat) için: otherUser = karşıdaki kullanıcı
    chats = chats.map((chat: any) => {
        if (!chat.isGroupChat) {
            chat.otherUser = chat.users.find(
                (u: any) => u._id.toString() !== currentUserId
            );
        }
        return chat;
    });

}

export const createGroupChatService = async(
    currentUserId: string,
    chatName: string,
    users: string[]
) => {
    if (!chatName || !users) throw new ApiError(400, "chatName and users are required");
    
      if (!Array.isArray(users)) throw new ApiError(400, "Users must be an array");
    
      if (users.length < 2) throw new ApiError(400, "At least 2 users are required to form a group");
    
      if (!users.includes(currentUserId)) {
        users.push(currentUserId);
      }

  const groupChat = await Chat.create({
    chatName,
    isGroupChat: true,
    users,
    groupAdmin: currentUserId,
  });

  const fullGroup = await Chat.findById(groupChat._id)
    .populate("users", "username email avatar")
    .populate("groupAdmin", "username email avatar");

  return fullGroup;
}