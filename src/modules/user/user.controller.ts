import { createUser, authenticateUser, generateTokens } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import User, { IUser } from "./user.model.js";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET } from "../../config/env.js";


export const register = catchAsync(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const user = await createUser(data);
    sendResponse(res, 201, "User created", user);
})

export const login = catchAsync(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await authenticateUser(data.email, data.password);
    const tokens = generateTokens(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    sendResponse(res, 200, "Login successful", { user, ...tokens });
})

export const logout = catchAsync(async (req, res) => {
    const userId = (req as any).user.id

    if (!userId) throw new ApiError(401, "Unauthorized")

    await User.findByIdAndUpdate(userId, { refreshToken: null })
    sendResponse(res, 200, "Logout successful", null)
})

export const getProfile = catchAsync(async (req, res) => {
    const userId = (req as any).user.id

    if (!userId) throw new ApiError(401, "Unauthorized")

    const user = await User.findOne({ _id: userId }).select('-password').lean()
    sendResponse(res, 200, "User profile fetched", user)
})

export const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body
    if (!refreshToken) throw new ApiError(400, "Refresh token is required")
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as { id: string }
    const user = await User.findById(decoded.id)

    if (!user) throw new ApiError(401, "Invalid refresh token")

    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Token mismatch or already used");
    }

    const tokens = generateTokens(user as IUser)

    user.refreshToken = tokens.refreshToken
    await user.save()
    sendResponse(res, 200, "Token refreshed", tokens)
})


export const updateProfile = catchAsync(async (req, res) => {
    const userId = (req as any).user.id;
  
  
    const { email, username, avatar } = req.body;
  
    if (!email && !username && !avatar) {
      throw new ApiError(400, "At least one field (email, username, avatar) is required to update");
    }
  
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
  
    sendResponse(res, 200, "Profile updated successfully", updatedUser);
  });
  
