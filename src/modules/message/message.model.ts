import mongoose, { Document, Schema } from "mongoose";
import { IChat } from "../chat/chat.model.js";
import { IUser } from "../user/user.model.js";

export interface IMessage extends Document {
  sender: IUser["_id"];
  content: string;
  chat: IChat["_id"];
  readBy?: IUser["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
