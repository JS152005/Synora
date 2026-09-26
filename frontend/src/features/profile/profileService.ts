import {
  getMyProfile,
  updateProfile,
  uploadProfileImage,
} from "../../api/profile.api";

import type {
  Profile,
  UpdateProfilePayload,
  UpdateProfileResponse,
  UploadProfileImageResponse,
} from "./profileTypes";

class ProfileService {
  async getProfile(): Promise<Profile> {
    return await getMyProfile();
  }

  async update(
    data: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> {
    return await updateProfile(data);
  }

  async uploadImage(
    file: File
  ): Promise<UploadProfileImageResponse> {
    return await uploadProfileImage(file);
  }
}

export default new ProfileService();
