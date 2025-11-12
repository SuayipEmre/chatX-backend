import { Request, Response } from "express";
import { createUser, authenticateUser, generateTokens } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await createUser(data);
        sendResponse(res, 201, "User created", user);
    } catch (err: any) {
        res.status(400).json({
            status: 400,
            message: 'User creation failed',
            error: err.message
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await authenticateUser(data.email, data.password);
        const tokens = generateTokens(user);
        sendResponse(res, 200, "Login successful", { user, ...tokens });
        
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
