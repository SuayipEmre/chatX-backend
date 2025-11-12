import { createUser, authenticateUser, generateTokens } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/CatchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "./user.model.js";


export const register = catchAsync(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const user = await createUser(data);
    sendResponse(res, 201, "User created", user);
});

export const login = catchAsync(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await authenticateUser(data.email, data.password);
    const tokens = generateTokens(user);
    sendResponse(res, 200, "Login successful", { user, ...tokens });
});



export const getProfile = catchAsync(async (req, res) => {
    const userId = (req as any).user.id

    if (!userId) throw new ApiError(401, "Unauthorized")

    const user = await User.findOne({_id:userId}).select('-password').lean()
    sendResponse(res, 200, "User profile fetched", user)
})