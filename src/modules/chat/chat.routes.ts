import express from 'express'

const router = express.Router()

import { accessChat, createGroupChat, fetchChats } from './chat.controller.js'
import { protectRoute } from '../../middlewares/auth.middleware.js'


router.post('/', protectRoute, accessChat)
router.get('/', protectRoute, fetchChats)
router.post("/group", protectRoute, createGroupChat);

export default router