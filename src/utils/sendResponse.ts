import { Response } from "express";

export interface ApiResponse<T = unknown> {
    statusCode: number;
    status: "success" | "error";
    message: string;
    data?: T | null;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
) => {
    const payload: ApiResponse<T> = {
        statusCode,
        status: "success",
        message,
        data,
    };
    console.log('Response Payload:', payload);
    

    return res.status(statusCode).json(payload);
};
