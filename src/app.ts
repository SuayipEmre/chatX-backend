import express from 'express'
import cors from "cors"
import { config } from 'dotenv'
import userRoutes from './modules/user/user.routes.js'

config()


const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/users', userRoutes)



export default app