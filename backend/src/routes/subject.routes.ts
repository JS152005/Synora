import { Router } from "express";
import {
  getSubjects,
  getSubjectTopics,
  getTopicChildren,
} from "../controllers/subject.controller";

const router = Router();

// GET /subjects
router.get("/", getSubjects);

// GET /subjects/:id/topics
router.get("/:id/topics", getSubjectTopics);

// GET /subjects/topics/:id/children
router.get("/topics/:id/children", getTopicChildren);

export default router;