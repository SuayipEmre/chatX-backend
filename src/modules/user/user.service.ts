import User, { IUser } from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { ApiError } from "../../utils/ApiError.js";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../../config/env.js";
import { bucket } from "../../config/firebase.js";

export const createUser = async (email : string, username : string, password : string) => {
    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    const exists = await User.findOne({ email: email });
    if (exists) throw new ApiError(400, "Email already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username,
        email: email,
        password: hashed,
    });

    const tokens = generateTokens(user);
    const cleanUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: tokens.refreshToken },
        { new: true }
    ).select('-refreshToken').lean()
    return {user : cleanUser, tokens}

};

export const authenticateUser = async (email: string, password: string) => {
    let user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "Invalid email or password");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(400, "Invalid email or password");

    const tokens = generateTokens(user);
    const cleanUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: tokens.refreshToken },
        { new: true }
    ).select('-refreshToken').lean()

    return { user: cleanUser, tokens };
};

export const generateTokens = (user: IUser) => {

    const accessToken = jwt.sign(
        { id: user._id },
        JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

export const refreshTokenService = async (refreshToken: string) => {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as { id: string }

    const user = await User.findById(decoded.id)

    if (!user) throw new ApiError(401, "Invalid refresh token")

    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Token mismatch or already used");
    }

    const tokens = generateTokens(user as IUser)

    user.refreshToken = tokens.refreshToken
    await user.save()

    const cleanUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  return {
    tokens,
    user: cleanUser,
  };
}

export const getProfileService = async (userId: string) => {
    if (!userId) throw new ApiError(401, "Unauthorized")
    const user = User.findById(userId).select('-password').lean();
    return user
}

export const searchUsersService = async (query: string, page: number, limit: number, userId: string) => {
    if (!query) throw new ApiError(400, "Search query is required");

    const skip = (page - 1) * limit;

    // Text + regex hybrid search filter
    const searchFilter = {
        $and: [
            { _id: { $ne: userId } },
            {
                $or: [
                    { $text: { $search: query } },
                    { username: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                ],
            },
        ],
    };

    // Count for pagination
    const total = await User.countDocuments(searchFilter);

    // Fetch users
    const users = await User.find(searchFilter)
        .select("-password -refreshToken")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .lean();

    const totalPages = Math.ceil(total / limit);

    return {
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
        data: users,
    };
};

export const changePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await User.findById(userId).select('+password')

    if (!user) throw new ApiError(404, "User not found")

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new ApiError(400, "Old password is incorrect")

    if (oldPassword === newPassword) throw new ApiError(400, "New password must be different from old password")

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword
    user.refreshToken = null
    await user.save()

    return
}

export const updateProfileService = async (userId: string, email?: string, username?: string, avatar?: string) => {

    if (email) {
        const existingUser = await User.findOne({ email }).lean()
        if (existingUser && existingUser._id.toString() !== userId) {
            throw new ApiError(400, "Email already in use");
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email, username, avatar },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) throw new ApiError(404, "User not found");


    return updatedUser

}


export const uploadUserAvatarService = async (base64: string) => {
    try {
      const buffer = Buffer.from(base64, "base64");
  
      const fileName = `avatars/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.jpg`;
      const file = bucket.file(fileName);
  
      await file.save(buffer, {
        metadata: {
          contentType: "image/png",
        },
        public: true,
      });

      await file.makePublic()
  
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
      return imageUrl;
    } catch (error) {
      console.log("Firebase upload error:", error);
      throw new ApiError(500, "Avatar upload failed");
    }
  };
  