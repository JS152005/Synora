import { Router } from "express";
import { authenticate, requireVerified } from "../middleware/authMiddleware";

import {
  getMe,
  updateProfile,
  searchUsers,
  discoverUsers,
  getPublicProfile,
  getRecommendations,
} from "../controllers/userController";

const router = Router();

// My Profile (needs authentication, can view own unverified/verified status)
router.get("/me", authenticate, getMe);

// Verified Medical Student Access Only
router.put("/profile", authenticate, requireVerified, updateProfile);
router.get("/discover", authenticate, requireVerified, discoverUsers);
router.get("/search", authenticate, requireVerified, searchUsers);
router.get("/recommendations", authenticate, requireVerified, getRecommendations);
router.get("/:id/profile", authenticate, requireVerified, getPublicProfile);

export default router;