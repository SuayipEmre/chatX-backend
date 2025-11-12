import express from 'express'
import cors from "cors"
import { config } from 'dotenv'
import userRoutes from './modules/user/user.routes.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
config()


const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/users', userRoutes)


app.use(errorMiddleware)

export default app