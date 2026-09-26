import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";

import {
    getMe,
    updateProfile,
    searchUsers,
    discoverUsers,
    getPublicProfile,
    getRecommendations
} from "../controllers/userController";

const router = Router();

/**
 * ==========================================================
 * Discovery
 * ==========================================================
 */

// Discover Users
router.get(
    "/discover",
    verifyToken,
    discoverUsers
);

// Search Users
router.get(
    "/search",
    verifyToken,
    searchUsers
);

// Recommendations
router.get(
    "/recommendations",
    verifyToken,
    getRecommendations
);

// Public Profile
router.get(
    "/:id/profile",
    verifyToken,
    getPublicProfile
);

/**
 * ==========================================================
 * User Profile
 * ==========================================================
 */

// My Profile
router.get(
    "/me",
    verifyToken,
    getMe
);

// Update Profile
router.put(
    "/profile",
    verifyToken,
    updateProfile
);

export default router;