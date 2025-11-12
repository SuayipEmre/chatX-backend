
import { Router } from "express";
import { getProfile, login, register } from "./user.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getProfile);

export default router