import express from "express"
import { protectRoute } from "../../middlewares/auth.middleware.js"
import { addToGroupController, changeGroupAdminController, createGroupController, fetchGroupDetailsController, removeFromGroupController, renameGroupController } from "./group.controller.js"

const router = express.Router()

router.post('/add-user', protectRoute, addToGroupController)
router.post('/remove-user', protectRoute, removeFromGroupController)
router.patch('/rename', protectRoute, renameGroupController)
router.post('/create', protectRoute, createGroupController)
router.patch('/change-admin', protectRoute, changeGroupAdminController)
router.get('/details', protectRoute, fetchGroupDetailsController)

export default router