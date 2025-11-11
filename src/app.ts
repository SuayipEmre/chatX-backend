import express from 'express'
import cors from "cors"
import { config } from 'dotenv'


config()


const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))




export default app