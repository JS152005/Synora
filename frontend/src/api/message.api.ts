import axiosInstance from "./axios";
import type { Message, MessageType } from "../types/chat";

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: MessageType;
}

export const sendMessage = async (
  payload: SendMessagePayload
): Promise<{ success: boolean; message: string; data: Message }> => {
  const response = await axiosInstance.post("/message", payload);
  return response.data;
};

export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: Message[];
  }>(`/message/${conversationId}`);
  return response.data.data;
};

export const markConversationAsRead = async (
  conversationId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.patch(
    `/message/read/${conversationId}`
  );
  return response.data;
};

export const deleteMessage = async (
  messageId: string
): Promise<{ success: boolean; message: string; data: Message }> => {
  const response = await axiosInstance.delete(`/message/${messageId}`);
  return response.data;
};
