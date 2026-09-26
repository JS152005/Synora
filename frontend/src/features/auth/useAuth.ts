import { useAppDispatch, useAppSelector } from "../../store/hooks";
import * as authService from "./authService";

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,

    login: (email: string, password: string) =>
      dispatch(authService.login(email, password)),

    register: authService.register,

    loadUser: () => dispatch(authService.loadUser()),

    logout: () => dispatch(authService.logout()),
  };
};
