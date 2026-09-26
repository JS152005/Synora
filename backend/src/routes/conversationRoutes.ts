import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createConversation,
  getConversations,
  getConversationById,
} from "../controllers/conversationController";

const router = Router();

router.post(
  "/",
  authenticate,
  createConversation
);

router.get(
  "/",
  authenticate,
  getConversations
);

router.get(
  "/:id",
  authenticate,
  getConversationById
);

export default router;