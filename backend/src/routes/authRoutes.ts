import { Router } from "express";
import {
  testAuth,
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  getColleges,
  getCourses,
  testEmail,
  forgotPassword,
  verifyResetOtp,
  resendResetOtp,
  resetPassword,
  changePassword,
  updateSettings,
  requestChangePasswordOtp,
  getRegistrationStatus,
} from "../controllers/authController";
import { uploadProfileImage } from "../controllers/uploadController";
import { authenticate } from "../middleware/authMiddleware";
import upload from "../config/multer";
import {
  loginLimiter,
  registerLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  passwordResetLimiter,
} from "../utils/rateLimiter";

const router = Router();

router.get("/test", testAuth);
router.post("/test-email", testEmail);

// Public Data APIs
router.get("/colleges", getColleges);
router.get("/courses", getCourses);

// Verification & Authentication
router.post("/register", registerLimiter, register);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/resend-otp", otpResendLimiter, resendOtp);
router.get("/registration-status/:id", getRegistrationStatus);
router.post("/login", loginLimiter, login);

// Forgot & Reset Password
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/verify-reset-otp", otpVerifyLimiter, verifyResetOtp);
router.post("/resend-reset-otp", otpResendLimiter, resendResetOtp);
router.post("/reset-password", passwordResetLimiter, resetPassword);

// Authenticated User Endpoints
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password/request-otp", authenticate, otpResendLimiter, requestChangePasswordOtp);
router.put("/change-password", authenticate, changePassword);
router.put("/settings", authenticate, updateSettings);
router.put(
  "/profile/image",
  authenticate,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;