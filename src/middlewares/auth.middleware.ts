import { NextFunction, Request } from 'express';
import { JWT_SECRET } from '../config/env.js';
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js';

interface JwtPayload {
    id: string;
    iat: number;
    exp: number;
  }

const ProtectRoute = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided')
        }
        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload
        (req as any).user = { id: decoded.id }
        next()

        
    } catch (err:any) {
        if (err.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid token"));
          }
      
          if (err.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token expired"));
          }
      
          return next(err);
    }
}

export default ProtectRoute;