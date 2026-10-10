import { Request, Response } from "express";
import {
  RegisterUser,
  LoginUser,
  UpdateProfile,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
} from "../models/userModel";
import {
  testAuthService,
  registerService,
  verifyOtpService,
  resendOtpService,
  loginService,
  getMeService,
  updateProfileService,
  getCollegesService,
  getCoursesService,
  forgotPasswordService,
  verifyResetOtpService,
  resendResetOtpService,
  resetPasswordService,
  changePasswordService,
  updateSettingsService,
  requestChangePasswordOtpService,
  getRegistrationStatusService,
} from "../services/authService";
import { sendTestEmail } from "../services/emailService";
import { AuthRequest } from "../middleware/authMiddleware";

export const testAuth = (req: Request, res: Response) => {
  const result = testAuthService();
  res.json(result);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: RegisterUser = req.body;
    const result = await registerService(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const params: VerifyOtpRequest = req.body;
    const result = await verifyOtpService(params);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed.",
    });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const params: ResendOtpRequest = req.body;
    const result = await resendOtpService(params);
    res.status(200).json(result);
  } catch (error: any) {
    const isCooldown = error.message?.includes("wait");
    res.status(isCooldown ? 429 : 400).json({
      success: false,
      message: error.message || "Failed to resend verification code.",
    });
  }
};

export const getRegistrationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";
    const result = await getRegistrationStatusService(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Pending registration record not found.",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: LoginUser = req.body;
    const result = await loginService(credentials);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed.",
    });
  }
};

// ============================================================
// FORGOT & RESET PASSWORD CONTROLLERS
// ============================================================

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params: ForgotPasswordRequest = req.body;
    const result = await forgotPasswordService(params);
    res.status(200).json(result);
  } catch (error: any) {
    const isUnregistered = error.message === "This email is not registered.";
    res.status(isUnregistered ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to process password reset request.",
    });
  }
};

export const verifyResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params: VerifyResetOtpRequest = req.body;
    const result = await verifyResetOtpService(params);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed.",
    });
  }
};

export const resendResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await resendResetOtpService({ email });
    res.status(200).json(result);
  } catch (error: any) {
    const isCooldown = error.message?.includes("wait");
    res.status(isCooldown ? 429 : 400).json({
      success: false,
      message: error.message || "Failed to resend verification code.",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params: ResetPasswordRequest = req.body;
    const result = await resetPasswordService(params);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Password reset failed.",
    });
  }
};

// ============================================================
// SETTINGS & PASSWORD CHANGE CONTROLLERS
// ============================================================

export const requestChangePasswordOtp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await requestChangePasswordOtpService(req.user!.id);
    res.status(200).json(result);
  } catch (error: any) {
    const isCooldown = error.message?.includes("wait");
    res.status(isCooldown ? 429 : 400).json({
      success: false,
      message: error.message || "Failed to send password change verification code.",
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const params: ChangePasswordRequest = req.body;
    const result = await changePasswordService(req.user!.id, params);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to change password.",
    });
  }
};

export const updateSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const settings: UpdateSettingsRequest = req.body;
    const result = await updateSettingsService(req.user!.id, settings);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to save settings.",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getMeService(req.user!.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "User profile not found.",
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data: UpdateProfile = req.body;
    const result = await updateProfileService(req.user!.id, data);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

export const getColleges = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const state = req.query.state as string | undefined;
    const colleges = await getCollegesService(search, state);
    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical colleges.",
    });
  }
};

export const getCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await getCoursesService();
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch academic courses.",
    });
  }
};

export const testEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({
      success: false,
      message: "Test email endpoint is forbidden in production.",
    });
    return;
  }
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
      return;
    }
    const info = await sendTestEmail(email);
    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}.`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send test email.",
    });
  }
};