import express from 'express'
import cors from "cors"
import { config } from 'dotenv'
import userRoutes from './modules/user/user.routes.js'
import chatRoutes from './modules/chat/chat.routes.js'
import messageRoutes from './modules/message/message.routes.js'
import groupRoutes from "./modules/group/group.routes.js";
import { errorMiddleware } from './middlewares/error.middleware.js'
config()



const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/users', userRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/messages', messageRoutes)
app.use("/api/groups", groupRoutes);


app.use(errorMiddleware)

export default app