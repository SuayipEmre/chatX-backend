import { Router } from "express";
import { sendMessage, getMessages, markAsReadController } from "./message.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protectRoute, sendMessage);
router.get("/:chatId", protectRoute, getMessages);
router.post('/read', protectRoute, markAsReadController)

export default router;
