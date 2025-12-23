import { JWT_SECRET } from "../config/env.js"
import jwt from 'jsonwebtoken'

export const signAccessToken = (userId: string) => {
    return jwt.sign(
      { id: userId },
      JWT_SECRET as string,
      { expiresIn: '15m' }
    )
  }