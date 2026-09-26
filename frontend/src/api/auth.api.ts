import axiosInstance from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export const register = async (data: RegisterRequest) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginRequest) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data: FormData) => {
  const response = await axiosInstance.put("/auth/profile", data);
  return response.data;
};

export const updateProfileImage = async (data: FormData) => {
  const response = await axiosInstance.put(
    "/auth/profile/image",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
