import express from 'express'

const router = express.Router()

import { accessChat, fetchChats } from './chat.controller.js'
import { protectRoute } from '../../middlewares/auth.middleware.js'


router.post('/', protectRoute, accessChat)
router.get('/', protectRoute, fetchChats)


export default router