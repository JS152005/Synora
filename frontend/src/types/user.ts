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

export interface College {
  id: string;
  code: string;
  name: string;
  officialName?: string;
  city: string;
  state: string;
  country: string;
  type?: string;
  emailDomains: string[];
  hasVerifiedDomain: boolean;
}

export interface AcademicYear {
  id: string;
  yearCode: string;
  displayName: string;
  order: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  durationYears: number;
  academicYears?: AcademicYear[];
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  college?: string;
  collegeId?: string;
  course?: string;
  courseId?: string;
  year?: string;
}

export interface TopicInProfile {
  id: string;
  name: string;
  level?: number;
  subject?: {
    id: string;
    name: string;
  };
}

export interface UserTopicWithTopic {
  type: "CAN_HELP" | "LEARNING";
  topic: TopicInProfile;
}

export interface PublicProfileUser extends User {
  userTopics?: UserTopicWithTopic[];
}

export interface DiscoverUsersParams {
  name?: string;
  college?: string;
  course?: string;
  year?: string;
  subjectId?: string;
  topicId?: string;
  page?: number;
  limit?: number;
}

export interface DiscoverUsersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  users: PublicProfileUser[];
}
