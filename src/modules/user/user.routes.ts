
import { Router } from "express";
import { changePassword, getAllUser, getProfile, login, logout, refreshToken, register, searchUsers, updateProfile, uploadUserAvatar } from "./user.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.post('/refresh-token', refreshToken)

router.get("/me", protectRoute, getProfile);
router.put('/me', protectRoute, updateProfile)
router.post('/me/avatar', protectRoute, uploadUserAvatar)
router.put('/change-password', protectRoute, changePassword)

router.get('/search', protectRoute, searchUsers)
router.get('/', protectRoute, getAllUser)
export default router