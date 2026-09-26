import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  sendStudyPartnerRequest,
  cancelStudyPartnerRequest,
  acceptStudyPartnerRequest,
  rejectStudyPartnerRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getStudyPartners,
} from "../controllers/studyPartnerController";

const router = Router();

router.post("/request", authenticate, sendStudyPartnerRequest);

router.patch(
  "/cancel/:requestId",
  authenticate,
  cancelStudyPartnerRequest
);

router.patch(
  "/accept/:requestId",
  authenticate,
  acceptStudyPartnerRequest
);

router.patch(
  "/reject/:requestId",
  authenticate,
  rejectStudyPartnerRequest
);

router.get(
  "/incoming",
  authenticate,
  getIncomingRequests
);

router.get(
  "/outgoing",
  authenticate,
  getOutgoingRequests
);

router.get(
  "/list",
  authenticate,
  getStudyPartners
);

export default router;