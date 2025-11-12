import { createUser, authenticateUser, generateTokens } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/CatchAsync.js";


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


