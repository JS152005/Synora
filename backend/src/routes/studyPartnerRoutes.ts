import { Router } from "express";
import { authenticate, requireVerified } from "../middleware/authMiddleware";
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

// Protect all study partner routes: Authenticated & Verified status required
router.use(authenticate);
router.use(requireVerified);

router.post("/request", sendStudyPartnerRequest);
router.patch("/cancel/:requestId", cancelStudyPartnerRequest);
router.patch("/accept/:requestId", acceptStudyPartnerRequest);
router.patch("/reject/:requestId", rejectStudyPartnerRequest);
router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);
router.get("/list", getStudyPartners);

export default router;