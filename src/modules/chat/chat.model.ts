import mongoose, { Schema } from "mongoose";
import { IUser } from "../user/user.model.js";

export interface IChat extends Document {
    _id: mongoose.Types.ObjectId;
    chatName?: string;
    isGroupChat: boolean;
    users: IUser["_id"][];
    latestMessage?: mongoose.Types.ObjectId;
    groupAdmin?: IUser["_id"];
    createdAt: Date;
    updatedAt: Date;
    group : mongoose.Types.ObjectId | null;
}



const ChatSchema = new mongoose.Schema<IChat>(
    {
        chatName: {
            type: String,
            trim: true,
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        latestMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        
        groupAdmin: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },
    },
    { timestamps: true }
)

const Chat = mongoose.model<IChat>('Chat', ChatSchema);

export default Chat