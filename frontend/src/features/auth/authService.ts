import { login as loginAction, logout as logoutAction, setLoading } from "./authSlice";
import type { AppDispatch } from "../../store/store";
import * as authApi from "../../api/auth.api";

export const login =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await authApi.login({ email, password });

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

export const loadUser = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const user = await authApi.getMe();

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
