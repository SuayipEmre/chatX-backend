import { ApiError } from "../../utils/ApiError.js";
import Chat from "./chat.model.js";

/**
 * Access a direct chat or create a new one if it doesn’t exist
 */
export const accessChatService = async (currentUserId: string, userId: string) => {
    if (!userId) throw new ApiError(400, "User ID is required");

    // 1) Mevcut DM chat var mı?
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

    // 2) Yoksa yeni chat oluştur
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

    // 3) DM chat ise diğer kullanıcıyı tespit et
    if (!chat.isGroupChat) {
        (chat as any).otherUser = chat.users.find(
            (u: any) => u._id.toString() !== currentUserId
        );
    }

    return chat;
};

/**
 * Fetch all chats for logged-in user
 */
export const fetchChatsService = async (currentUserId: string) => {
    let chats = await Chat.find({
        users: { $elemMatch: { $eq: currentUserId } },
    })
        .populate("users", "username email avatar")
        .populate("groupAdmin", "username email avatar")
        .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username email avatar" },
        })
        .sort({ updatedAt: -1 })
        .lean();

    // DM chatlerde karşı kullanıcıyı ekle
    chats = chats.map((chat: any) => {
        if (!chat.isGroupChat) {
            chat.otherUser = chat.users.find(
                (u: any) => u._id.toString() !== currentUserId
            );
        }
        return chat;
    });

    return chats;
};

/**
 * Create a group chat
 */
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
