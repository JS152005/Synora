import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

router.get(
  "/",
  authenticate,
  getNotifications
);

router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsAsRead
);

router.patch(
  "/read/:id",
  authenticate,
  markNotificationAsRead
);

router.delete(
  "/:id",
  authenticate,
  deleteNotification
);

export default router;