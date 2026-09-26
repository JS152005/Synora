import { Router } from "express";
import {
  createUserTopic,
  getMyTopics,
  removeUserTopic,
} from "../controllers/userTopicController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes
router.use(verifyToken);

// Add a topic
router.post("/", createUserTopic);

// Get logged-in user's topics
router.get("/", getMyTopics);

// Remove a topic
router.delete("/:topicId/:type", removeUserTopic);

export default router;