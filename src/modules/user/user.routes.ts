
import { Router } from "express";
import { changePassword, getProfile, login, logout, refreshToken, register, updateProfile } from "./user.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.post('/refresh-token', refreshToken)

router.get("/me", protectRoute, getProfile);
router.put('/me', protectRoute, updateProfile)
router.put('/change-password', protectRoute, changePassword)
export default router