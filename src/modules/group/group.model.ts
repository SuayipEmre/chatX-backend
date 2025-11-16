import mongoose, { Document, Schema, Types } from "mongoose";



export interface IGroup extends Document {
    groupName: string;
    users: Types.ObjectId[];
    admin: Types.ObjectId;
    latestMessage?: Types.ObjectId;
    isGroupChat: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const GroupSchema = new mongoose.Schema<IGroup>(
    {
        groupName: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
        latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
        isGroupChat: { type: Boolean, default: true }

    },
    { timestamps: true }
);


const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;