import mongoose, { Schema } from "mongoose";
import { IUser } from "../user/user.model.js";

export interface IChat extends Document {
    chatName?: string;
    isGroupChat: boolean;
    users: IUser["_id"][];
    latestMessage?: mongoose.Types.ObjectId;
    groupAdmin?: IUser["_id"];
    createdAt: Date;
    updatedAt: Date;
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
    },
    {timestamps:true}
)

const Chat = mongoose.model<IChat>('Chat', ChatSchema);

export default Chat