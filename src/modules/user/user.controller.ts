import { createUser, authenticateUser, getProfileService, searchUsersService, changePasswordService, updateProfileService, refreshTokenService, uploadUserAvatarService } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "./user.model.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = catchAsync(async (req, res) => {
  const{ email, username, password } =registerSchema.parse(req.body)
  const {user, tokens} = await createUser(email, username, password);
  sendResponse(res, 201, "User created", {user, ...tokens});
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
})

export const login = catchAsync(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const { user, tokens } = await authenticateUser(data.email, data.password);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
  sendResponse(res, 200, "Login successful", {
    user, ...tokens
  });
})

export const logout = catchAsync(async (req, res) => {
  const userId = (req as any).user.id

  console.log('Logging out userId : ', userId);
  
  if (!userId) throw new ApiError(401, "Unauthorized")

  await User.findByIdAndUpdate(userId, { refreshToken: null })
  res.cookie('refreshToken', '', { ...refreshCookieOptions, maxAge: 0 });
  sendResponse(res, 200, "Logout successful", null)
})

export const getProfile = catchAsync(async (req, res) => {
  const userId = (req as any).user.id
  if (!userId) throw new ApiError(401, "Unauthorized")
  const user = await getProfileService(userId)
  sendResponse(res, 200, "User profile fetched", user)
})

export const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.['refreshToken'] || req.body.refreshToken

  if (!refreshToken) throw new ApiError(400, "Refresh token is required");

  const { tokens, user } = await refreshTokenService(refreshToken);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  sendResponse(res, 200, "Token refreshed", {
    user,
    ...tokens
  });
});

export const uploadUserAvatar = catchAsync(async (req, res) => {
  const { image } = req.body;

  if (!image) {
    throw new ApiError(400, "Image base64 is required");
  }

  const imageUrl = await uploadUserAvatarService(image);

  sendResponse(res, 201, "Avatar uploaded successfully", {
    imageUrl,
  });
});
export const updateProfile = catchAsync(async (req, res) => {
  const userId = (req as any).user.id;
  const { email, username, avatar } = req.body;

  if (!email && !username && !avatar) {
    throw new ApiError(400, "At least one field (email, username, avatar) is required to update");
  }

  const updatedUser = await updateProfileService(userId, email, username, avatar);
  sendResponse(res, 200, "Profile updated successfully", updatedUser);
});

export const changePassword = catchAsync(async (req, res) => {
  const userId = (req as any).user.id

  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) throw new ApiError(400, "Old password and new password are required")

  await changePasswordService(userId, oldPassword, newPassword)

  sendResponse(res, 200, "Password changed successfully", null)
})

export const getAllUser = catchAsync(async (req, res) => {
  const users = await User.find().select('-password -refreshToken').lean()
  sendResponse(res, 200, "All users fetched", users)
})

export const searchUsers = catchAsync(async (req, res) => {
  const { query } = req.query;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "10");
  const userId = (req as any).user.id;

  const result = await searchUsersService(
    query as string,
    page,
    limit,
    userId
  );

  sendResponse(res, 200, "Search results fetched", result);
});