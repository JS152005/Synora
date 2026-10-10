import axiosInstance from "./axios";
import type { User, College, Course, UpdateProfileRequest } from "../types/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  personalEmail: string;
  hasCollegeEmail?: boolean;
  collegeEmail?: string;
  collegeId: string;
  course?: string;
  courseId?: string;
  year: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyOtpRequest {
  registrationId?: string;
  userId?: string;
  emailType: "PERSONAL" | "COLLEGE";
  otp: string;
}

export interface ResendOtpRequest {
  registrationId?: string;
  userId?: string;
  emailType: "PERSONAL" | "COLLEGE";
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  registrationId?: string;
  userId: string;
  step: "VERIFY_PERSONAL_EMAIL" | "VERIFY_COLLEGE_EMAIL" | "VERIFIED";
  personalEmailMasked: string;
  hasCollegeEmail?: boolean;
  collegeEmailMasked?: string | null;
  requiresVerification: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  step: "VERIFY_PERSONAL_EMAIL" | "VERIFY_COLLEGE_EMAIL" | "VERIFIED" | "PENDING_INSTITUTION_VERIFICATION";
  personalEmailVerified: boolean;
  collegeEmailVerified: boolean;
  hasVerifiedMed?: boolean;
  isVerified: boolean;
  status?: string;
  token?: string;
  user?: User;
  registrationId?: string;
  collegeEmailMasked?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  maskedEmail?: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: User;
  requiresVerification?: boolean;
  userId?: string;
  step?: "VERIFY_PERSONAL_EMAIL" | "VERIFY_COLLEGE_EMAIL" | "PENDING_INSTITUTION_VERIFICATION";
  personalEmail?: string;
  collegeEmail?: string;
  personalEmailMasked?: string;
  collegeEmailMasked?: string;
  personalEmailVerified?: boolean;
  collegeEmailVerified?: boolean;
  isVerified?: boolean;
  status?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  emailMasked?: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  resetToken: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOtp = async (
  data: ResendOtpRequest
): Promise<ResendOtpResponse> => {
  const response = await axiosInstance.post("/auth/resend-otp", data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const verifyResetOtp = async (
  email: string,
  otp: string
): Promise<VerifyResetOtpResponse> => {
  const response = await axiosInstance.post("/auth/verify-reset-otp", {
    email,
    otp,
  });
  return response.data;
};

export const resendResetOtp = async (
  email: string
): Promise<{ success: boolean; message: string; maskedEmail?: string }> => {
  const response = await axiosInstance.post("/auth/resend-reset-otp", { email });
  return response.data;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<ResetPasswordResponse> => {
  const response = await axiosInstance.post("/auth/reset-password", {
    resetToken,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export const requestChangePasswordOtp = async (): Promise<{
  success: boolean;
  message: string;
  emailMasked?: string;
}> => {
  const response = await axiosInstance.post("/auth/change-password/request-otp");
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  otp: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.put("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
    otp,
  });
  return response.data;
};

export const getRegistrationStatus = async (
  registrationId: string
): Promise<{
  success: boolean;
  registrationId: string;
  personalEmail: string;
  collegeEmail?: string | null;
  personalEmailVerified: boolean;
  collegeEmailVerified: boolean;
  hasCollegeEmail: boolean;
  isComplete: boolean;
  status: string;
}> => {
  const response = await axiosInstance.get(`/auth/registration-status/${registrationId}`);
  return response.data;
};

export const updateSettings = async (settings: {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  livePresence?: boolean;
}): Promise<{ success: boolean; message: string; settings: any }> => {
  const response = await axiosInstance.put("/auth/settings", settings);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<{ message: string; user: User }> => {
  const response = await axiosInstance.put("/auth/profile", data);
  return response.data;
};

export const uploadProfileImage = async (
  file: File
): Promise<{ message: string; user: User }> => {
  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await axiosInstance.put("/auth/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getColleges = async (
  search?: string,
  state?: string
): Promise<College[]> => {
  const response = await axiosInstance.get("/auth/colleges", {
    params: { search, state },
  });
  return response.data.data;
};

export const getCourses = async (): Promise<Course[]> => {
  const response = await axiosInstance.get("/auth/courses");
  return response.data.data;
};
