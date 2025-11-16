import express from "express"
import { protectRoute } from "../../middlewares/auth.middleware.js"
import { addToGroupController, createGroupController, removeFromGroupController, renameGroupController } from "./group.controller.js"

const router = express.Router()

router.post('/add-user', protectRoute, addToGroupController)
router.post('/remove-user', protectRoute, removeFromGroupController)
router.patch('/rename', protectRoute, renameGroupController)
router.post('/create', protectRoute, createGroupController)

export default router