import { Router } from "express";
import { authenticate, requireVerified } from "../middleware/authMiddleware";
import {
  createConversation,
  getConversations,
  getConversationById,
} from "../controllers/conversationController";

const router = Router();

// Protect all conversation routes: Authenticated & Verified status required
router.use(authenticate);
router.use(requireVerified);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversationById);

export default router;