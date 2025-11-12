import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async controller to automatically forward errors to next().
 * 
 * Example usage:
 * export const login = catchAsync(async (req, res) => {
 *   const user = await User.findById(req.user.id);
 *   res.json(user);
 * });
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
