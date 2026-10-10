export interface RegisterUser {
  fullName: string;
  email?: string; // Optional legacy fallback
  personalEmail: string;
  hasCollegeEmail?: boolean;
  collegeEmail?: string;
  collegeId: string;
  courseId?: string;
  course?: string;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

export interface RequestChangePasswordOtpRequest {
  currentPassword?: string;
}


export interface UpdateSettingsRequest {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  livePresence?: boolean;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface UpdateProfile {
  fullName?: string;
  bio?: string;
  college?: string;
  collegeId?: string;
  course?: string;
  courseId?: string;
  year?: string;
}