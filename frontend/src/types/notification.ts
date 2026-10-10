export type NotificationType =
  | "STUDY_REQUEST"
  | "REQUEST_ACCEPTED"
  | "REQUEST_REJECTED";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
