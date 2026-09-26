import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  sendMessage,
  getMessages,
  markConversationAsRead,
  deleteMessage,
} from "../controllers/messageController";

const router = Router();

router.post(
  "/",
  authenticate,
  sendMessage
);

router.get(
  "/:conversationId",
  authenticate,
  getMessages
);

router.patch(
  "/read/:conversationId",
  authenticate,
  markConversationAsRead
);

router.delete(
  "/:messageId",
  authenticate,
  deleteMessage
);

export default router;