export interface User {
  id: string;
  fullName: string;
  email: string;
  personalEmail?: string | null;
  collegeEmail?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  college?: string | null;
  collegeId?: string | null;
  course?: string | null;
  courseId?: string | null;
  year?: string | null;
  personalEmailVerified?: boolean;
  collegeEmailVerified?: boolean;
  hasVerifiedMed?: boolean;
  isVerified?: boolean;
  status?: string;
  role?: string;
  theme?: string;
  emailNotifications?: boolean;
  livePresence?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
