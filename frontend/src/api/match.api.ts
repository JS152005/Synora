import axiosInstance from "./axios";
import type { MatchResult } from "../types/match";

export const getHelpers = async (): Promise<MatchResult[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: MatchResult[];
  }>("/match/helpers");
  return response.data.data;
};

export const getLearners = async (): Promise<MatchResult[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: MatchResult[];
  }>("/match/learners");
  return response.data.data;
};

export const getHelpersByTopic = async (
  topicId: string
): Promise<MatchResult[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: MatchResult[];
  }>(`/match/helpers/${topicId}`);
  return response.data.data;
};

export const getLearnersByTopic = async (
  topicId: string
): Promise<MatchResult[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    count: number;
    data: MatchResult[];
  }>(`/match/learners/${topicId}`);
  return response.data.data;
};
