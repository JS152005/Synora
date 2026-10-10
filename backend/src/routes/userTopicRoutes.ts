import { Router } from "express";
import {
  createUserTopic,
  getMyTopics,
  removeUserTopic,
} from "../controllers/userTopicController";
import { authenticate, requireVerified } from "../middleware/authMiddleware";

const router = Router();

// Protect all topic routes: requires authenticated and verified student
router.use(authenticate);
router.use(requireVerified);

// Add a topic
router.post("/", createUserTopic);

// Get logged-in user's topics
router.get("/", getMyTopics);

// Remove a topic
router.delete("/:topicId/:type", removeUserTopic);

export default router;