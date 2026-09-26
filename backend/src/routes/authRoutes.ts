import { Router } from "express";
import {
  testAuth,
  register,
  login,
  getMe,
  updateProfile,
} from "../controllers/authController";
import { uploadProfileImage } from "../controllers/uploadController";
import { authenticate } from "../middleware/authMiddleware";
import upload from "../config/multer";

const router = Router();

router.get("/test", testAuth);

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, getMe);

router.put("/profile", authenticate, updateProfile);

router.put(
  "/profile/image",
  authenticate,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;