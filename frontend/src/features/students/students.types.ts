export interface Student {
  id: string;
  fullName: string;
  profileImage: string | null;
  bio: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
}

export interface DiscoverStudentsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  users: Student[];
}

export interface DiscoverStudentsParams {
  name?: string;
  course?: string;
  year?: string;
  page?: number;
  limit?: number;
}
