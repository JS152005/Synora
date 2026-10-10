import axiosInstance from "./axios";
import type { Conversation } from "../types/chat";

export const createConversation = async (
  partnerId: string
): Promise<{ success: boolean; message: string; data: Conversation }> => {
  const response = await axiosInstance.post("/conversation", { partnerId });
  return response.data;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: Conversation[];
  }>("/conversation");
  return response.data.data;
};

export const getConversationById = async (
  conversationId: string
): Promise<Conversation> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: Conversation;
  }>(`/conversation/${conversationId}`);
  return response.data.data;
};
