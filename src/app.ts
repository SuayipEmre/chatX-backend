import express from 'express'
import cors from "cors"
import { config } from 'dotenv'
import userRoutes from './modules/user/user.routes.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { JWT_SECRET } from './config/env.js'
config()


const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/users', userRoutes)

console.log('JWT_SECRET : ', JWT_SECRET);


app.use(errorMiddleware)

export default app