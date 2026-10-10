import axiosInstance from "./axios";
import type { Subject, Topic } from "../types/subject";

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: Subject[];
  }>("/subjects");
  return response.data.data;
};

export const getSubjectTopics = async (
  subjectId: string
): Promise<{ subject: Subject; topics: Topic[] }> => {
  const response = await axiosInstance.get<{
    success: boolean;
    subject: Subject;
    count: number;
    data: Topic[];
  }>(`/subjects/${subjectId}/topics`);
  return {
    subject: response.data.subject,
    topics: response.data.data,
  };
};

export const getTopicChildren = async (
  topicId: string
): Promise<Topic[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: Topic[];
  }>(`/subjects/topics/${topicId}/children`);
  return response.data.data;
};
