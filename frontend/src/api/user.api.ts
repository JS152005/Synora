import axiosInstance from "./axios";
import type {
  User,
  PublicProfileUser,
  DiscoverUsersParams,
  DiscoverUsersResponse,
  UpdateProfileRequest,
} from "../types/user";

export const discoverUsers = async (
  params?: DiscoverUsersParams
): Promise<DiscoverUsersResponse> => {
  const response = await axiosInstance.get("/user/discover", { params });
  return response.data;
};

export const searchUsers = async (
  search?: string
): Promise<User[]> => {
  const response = await axiosInstance.get("/user/search", {
    params: search ? { search } : {},
  });
  return response.data;
};

export const getRecommendations = async (
  limit = 10
): Promise<PublicProfileUser[]> => {
  const response = await axiosInstance.get("/user/recommendations", {
    params: { limit },
  });
  return response.data;
};

export const getPublicProfile = async (
  userId: string
): Promise<PublicProfileUser> => {
  const response = await axiosInstance.get(`/user/${userId}/profile`);
  return response.data;
};

export const getMyProfile = async (): Promise<User> => {
  const response = await axiosInstance.get("/user/me");
  return response.data;
};

export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<{ message: string; user: User }> => {
  const response = await axiosInstance.put("/user/profile", data);
  return response.data;
};
