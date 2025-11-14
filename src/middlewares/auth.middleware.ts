import { NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js';
import { JWT_SECRET } from '../config/env.js';
import User from '../modules/user/user.model.js';

interface JwtPayload {
    id: string;
    iat: number;
    exp: number;
  }

export const protectRoute = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader =  req.headers['authorization']
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided')
        }
        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload
        
        const user = await User.findById(decoded.id)
        
        if (!user || !user.refreshToken) {
          throw new ApiError(401, "Token invalid or user logged out");
        }

        (req as any).user = { id: decoded.id }
        
        next()

        
    } catch (err:any) {
        console.log('Error in ProtectRoute middleware:', err);
        
        if (err.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid token"));
          }
      
          if (err.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token expired"));
          }
      
          return next(err);
    }
}
