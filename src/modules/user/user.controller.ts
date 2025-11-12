import { NextFunction, Request, Response } from "express";
import { createUser, authenticateUser, generateTokens } from "./user.service.js";
import { registerSchema, loginSchema } from "./user.schema.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const register = async (req: Request, res: Response, next : NextFunction) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await createUser(data);
        sendResponse(res, 201, "User created", user);
    } catch (err: any) {
       next(err)
    }
};

export const login = async (req: Request, res: Response, next : NextFunction) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await authenticateUser(data.email, data.password);
        const tokens = generateTokens(user);
        sendResponse(res, 200, "Login successful", { user, ...tokens });
        
    } catch (err: any) {
        next(err)
    }
};
