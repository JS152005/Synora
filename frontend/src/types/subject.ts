export interface Subject {
  id: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: string;
  code: string;
  name: string;
  level: number;
  subjectId?: string;
  parentTopicId?: string | null;
  children?: Topic[];
}

export type UserTopicType = "CAN_HELP" | "LEARNING";

export interface UserTopicItem {
  id: string;
  userId: string;
  topicId: string;
  type: UserTopicType;
  createdAt?: string;
  topic?: {
    id: string;
    code: string;
    name: string;
    level: number;
    subjectId: string;
    subject?: {
      id: string;
      code: string;
      name: string;
    };
  };
}
