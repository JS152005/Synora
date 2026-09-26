export interface User {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  college?: string | null;
  course?: string | null;
  year?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
