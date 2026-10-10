import { Router } from "express";
import { authenticate, requireVerified } from "../middleware/authMiddleware";
import {
  sendMessage,
  getMessages,
  markConversationAsRead,
  deleteMessage,
} from "../controllers/messageController";

const router = Router();

// Protect all message routes: Authenticated & Verified status required
router.use(authenticate);
router.use(requireVerified);

router.post("/", sendMessage);
router.post("/send", sendMessage);
router.get("/:conversationId", getMessages);
router.patch("/read/:conversationId", markConversationAsRead);
router.patch("/:conversationId/read", markConversationAsRead);
router.delete("/:messageId", deleteMessage);

export default router;