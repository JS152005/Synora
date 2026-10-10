import { Router } from "express";
import { authenticate, requireVerified } from "../middleware/authMiddleware";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

// Protect all notification routes: Authenticated & Verified status required
router.use(authenticate);
router.use(requireVerified);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/read/:id", markNotificationAsRead);
router.patch("/:id", markNotificationAsRead);
router.delete("/:id", deleteNotification);

export default router;