import axiosInstance from "./axios";
import type { NotificationItem } from "../types/notification";

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: NotificationItem[];
  }>("/notification");
  return response.data.data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<{ success: boolean; message: string; data: NotificationItem }> => {
  const response = await axiosInstance.patch(`/notification/read/${id}`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await axiosInstance.patch("/notification/read-all");
  return response.data;
};

export const deleteNotification = async (
  id: string
): Promise<{ success: boolean; data: { message: string } }> => {
  const response = await axiosInstance.delete(`/notification/${id}`);
  return response.data;
};
