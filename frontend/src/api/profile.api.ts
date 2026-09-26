import axiosInstance from "./axios";

export interface UpdateProfileRequest {
  fullName: string;
  bio: string;
  college: string;
  course: string;
  year: string;
}

export const getMyProfile = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest
) => {
  const response = await axiosInstance.put(
    "/auth/profile",
    data
  );

  return response.data;
};

export const uploadProfileImage = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("profileImage", file);

  const response = await axiosInstance.put(
    "/auth/profile/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
