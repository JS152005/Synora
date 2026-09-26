export interface Profile {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  bio: string;
  college: string;
  course: string;
  year: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: Profile;
}

export interface UploadProfileImageResponse {
  message: string;
  user: Profile;
}
