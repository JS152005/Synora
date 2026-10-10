import { useAppDispatch, useAppSelector } from "../../store/hooks";
import * as authService from "./authService";
import * as authApi from "../../api/auth.api";
import type { RegisterRequest, VerifyOtpRequest, ResendOtpRequest } from "../../api/auth.api";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,

    login: (email: string, password: string) =>
      dispatch(authService.login(email, password)),

    register: (data: RegisterRequest) => authService.register(data),

    verifyOtp: (data: VerifyOtpRequest) =>
      dispatch(authService.verifyOtp(data)),

    resendOtp: (data: ResendOtpRequest) => authService.resendOtp(data),

    loadUser: () => dispatch(authService.loadUser()),

    logout: () => dispatch(authService.logout()),

    forgotPassword: (email: string) => authApi.forgotPassword(email),

    verifyResetOtp: (email: string, otp: string) =>
      authApi.verifyResetOtp(email, otp),

    resendResetOtp: (email: string) => authApi.resendResetOtp(email),

    resetPassword: (
      resetToken: string,
      newPassword: string,
      confirmPassword: string
    ) => authApi.resetPassword(resetToken, newPassword, confirmPassword),

    requestChangePasswordOtp: () => authApi.requestChangePasswordOtp(),

    changePassword: (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
      otp: string
    ) => authApi.changePassword(currentPassword, newPassword, confirmPassword, otp),

    updateSettings: (settings: {
      theme?: "light" | "dark" | "system";
      emailNotifications?: boolean;
      livePresence?: boolean;
    }) => authApi.updateSettings(settings),
  };
};
