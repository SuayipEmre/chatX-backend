import User, { IUser } from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.js";

export const createUser = async (data: {
    username: string;
    email: string;
    password: string;
}) => {
    console.log('Received data for user creation:', data);

    if (!data.username || !data.email || !data.password) {
        throw new Error("All fields are required");
    }
    console.log('Creating user with data:', data);

    const exists = await User.findOne({ email: data.email });
    if (exists) throw new ApiError(400, "Email already exists");

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        username: data.username,
        email: data.email,
        password: hashed,
    });

    return user;
};

export const authenticateUser = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(400, "Invalid email or password");

    return user;
};

export const generateTokens = (user: IUser) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};
