import { Router } from "express";
import {
  getSubjects,
  getSubjectTopics,
  getTopicChildren,
  getSubjectHierarchy,
} from "../controllers/subject.controller";

const router = Router();

// GET /subjects - Public / accessible for curriculum viewing
router.get("/", getSubjects);

// GET /subjects/:id/topics - Root topics of a subject
router.get("/:id/topics", getSubjectTopics);

// GET /subjects/topics/:id/children - Child subtopics
router.get("/topics/:id/children", getTopicChildren);

// GET /subjects/:id/hierarchy - Full tree: Subject -> Topic -> Subtopics
router.get("/:id/hierarchy", getSubjectHierarchy);

export default router;