import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "./authTypes";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    login: (
      state,
      action: PayloadAction<{
        user: User;
      }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const {
  setLoading,
  login,
  logout,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
