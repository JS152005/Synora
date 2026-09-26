import { Router } from "express";
import {
  getHelpers,
  getLearners,
  getHelpersByTopic,
  getLearnersByTopic,
} from "../controllers/matchController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Protect all match routes
router.use(verifyToken);

// Find helpers for all my learning topics
router.get("/helpers", getHelpers);

// Find learners for all my teaching topics
router.get("/learners", getLearners);

// Find helpers for a specific topic
router.get("/helpers/:topicId", getHelpersByTopic);

// Find learners for a specific topic
router.get("/learners/:topicId", getLearnersByTopic);

export default router;