
import mongoose, { Document } from "mongoose";


export interface IUser extends Document {
    username: string,
    email : string,
    password : string,
    avatar?:string,
    createdAt: Date,
    updatedAt: Date
}


const userSchema = new mongoose.Schema<IUser>({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    }
}, {timestamps: true})

const User = mongoose.model<IUser>('User', userSchema);

export default User