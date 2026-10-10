import { login as loginAction, logout as logoutAction, setLoading, updateUser } from "./authSlice";
import type { AppDispatch } from "../../store/store";
import * as authApi from "../../api/auth.api";
import type { VerifyOtpRequest } from "../../api/auth.api";

export const login =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await authApi.login({ email, password });

      // If user requires verification, do not log in yet
      if (response.requiresVerification || !response.token || !response.user) {
        return response;
      }

      localStorage.setItem("token", response.token);

      dispatch(
        loginAction({
          user: response.user,
        })
      );

      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const register = authApi.register;

export const verifyOtp =
  (data: VerifyOtpRequest) => async (dispatch: AppDispatch) => {
    const response = await authApi.verifyOtp(data);

    if (response.token && response.user) {
      localStorage.setItem("token", response.token);
      dispatch(
        loginAction({
          user: response.user,
        })
      );
    } else if (response.user) {
      dispatch(updateUser(response.user));
    }

    return response;
  };

export const resendOtp = authApi.resendOtp;

export const loadUser = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const user = await authApi.getMe();

    if (!user || (!user.personalEmailVerified && !user.isVerified)) {
      localStorage.removeItem("token");
      dispatch(logoutAction());
      return;
    }

    dispatch(
      loginAction({
        user,
      })
    );
  } catch {
    localStorage.removeItem("token");
    dispatch(logoutAction());
  } finally {
    dispatch(setLoading(false));
  }
};

export const logout = () => (dispatch: AppDispatch) => {
  localStorage.removeItem("token");
  dispatch(logoutAction());
};
