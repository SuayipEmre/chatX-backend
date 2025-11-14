import { Router } from "express";
import { sendMessage, getMessages } from "./message.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protectRoute, sendMessage);
router.get("/:chatId", protectRoute, getMessages);

export default router;
