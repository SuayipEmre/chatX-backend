import Message from "./message.model.js";
import Chat from "../chat/chat.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Types } from "mongoose";


export const createMessage = async (
    senderId: string,
    content: string,
    chatId: string
) => {
    if (!senderId || !content || !chatId) {
        throw new ApiError(400, "senderId, content and chatId are required");
    }

    let message = await Message.create({
        sender: senderId,
        content,
        chat: chatId,
    });

    message = await message.populate([
        { path: "sender", select: "username email avatar" },
        { path: "chat" },
    ]);

    const messageId = (message._id as Types.ObjectId).toString();

    await updateLatestMessage(chatId, messageId)

    return message;
};

export const getMessagesByChat = async (chatId: string) => {
    if (!chatId) throw new ApiError(400, "chatId is required");

    const messages = await Message.find({ chat: chatId })
        .populate("sender", "username email avatar")
        .populate("chat")
        .sort({ createdAt: 1 })
        .lean();

    return messages;
};


export const updateLatestMessage = async (
    chatId: string,
    messageId: string | Types.ObjectId
) => {
    if (!chatId || !messageId) {
        throw new ApiError(400, "chatId and messageId are required");
    }

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: new Types.ObjectId(messageId),
    });

    return true;
};

export const markMessageAsRead = async (messageId: string, userId: string) => {
    const message = await Message.findById(messageId)
    .populate('sender', 'username email')
    .populate('chat');
    if (!message) throw new ApiError(404, "Message not found");

    if(message?.readBy?.some(u => u?.toString() === userId)){
        return message
    }
    message?.readBy?.push(userId);
    await message.save();

    return message
}