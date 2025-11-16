import express from "express"
import { protectRoute } from "../../middlewares/auth.middleware.js"
import { addToGroupController, removeFromGroupController } from "./group.controller.js"

const router = express.Router()

router.post('/add-user', protectRoute, addToGroupController)
router.post('/remove-user', protectRoute, removeFromGroupController)

export default router