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

const allowedOrigins = [
    "http://localhost:3000",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({limit: '10mb'}))
app.use(express.urlencoded({ extended: true }))


app.use('/api/users', userRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/messages', messageRoutes)
app.use("/api/groups", groupRoutes);


app.use(errorMiddleware)

export default app