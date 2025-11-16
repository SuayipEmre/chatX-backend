import Message from "./message.model.js";
import Chat from "../chat/chat.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Types } from "mongoose";


export const createMessage = async (
    senderId: string,
    content: string,
    chatId: string
) => {
    // 1) Validasyon
    if (!senderId || !content || !chatId) {
        throw new ApiError(400, "senderId, content and chatId are required");
    }

    // 2) Mesajı oluştur
    let message = await Message.create({
        sender: senderId,
        content,
        chat: chatId,
    });

    // 3) Populates — gönderici ve chat bilgilerini doldur
    message = await message.populate([
        { path: "sender", select: "username email avatar" },
        { path: "chat" },
    ]);

    const messageId = (message._id as Types.ObjectId).toString();

    // 4) Chat'in son mesajını güncelle
    await updateLatestMessage(chatId, messageId)

    // 5) Controller'da kullanılmak üzere return et
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
    const message = await Message.findById(messageId);
    if (!message) throw new ApiError(404, "Message not found");

    if (message.readBy && !message.readBy.some(u => u?.toString() === userId)) {
        message.readBy.push(userId)
        await message.save();
    }

    return message
}