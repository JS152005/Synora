import axiosInstance from "./axios";
import type { UserTopicItem, UserTopicType } from "../types/subject";

export const getMyTopics = async (): Promise<UserTopicItem[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data:
      | UserTopicItem[]
      | {
          learning?: UserTopicItem[];
          canHelp?: UserTopicItem[];
        };
  }>("/user/topics");

  const raw = response.data.data;
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === "object") {
    return [...(raw.learning || []), ...(raw.canHelp || [])];
  }
  return [];
};

export const addUserTopic = async (
  topicId: string,
  type: UserTopicType
): Promise<{ success: boolean; message: string; data: UserTopicItem }> => {
  const response = await axiosInstance.post("/user/topics", {
    topicId,
    type,
  });
  return response.data;
};

export const removeUserTopic = async (
  topicId: string,
  type: UserTopicType
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/user/topics/${topicId}/${type}`);
  return response.data;
};
