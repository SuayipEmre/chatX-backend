
import { Router } from "express";
import { getProfile, login, logout, refreshToken, register } from "./user.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.get("/me", protectRoute, getProfile);
router.post('/refresh-token', refreshToken)
export default router