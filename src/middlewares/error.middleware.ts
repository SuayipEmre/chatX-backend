import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose CastError
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Handle Duplicate Key Error
  if (err.code === 11000) {
    message = "Duplicate field value entered";
    statusCode = 400;
  }

  // Handle Validation Error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((value: any) => value.message)
      .join(", ");
    statusCode = 400;
  }

  return res.status(statusCode).json({
    statusCode,
    status: "error",
    message,
  });
};
