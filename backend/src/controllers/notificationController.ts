import { Request, Response } from "express";
import {
  getNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from "../services/notificationService";

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const notifications = await getNotificationsService(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await markNotificationAsReadService(
      userId,
      id
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await markAllNotificationsAsReadService(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await deleteNotificationService(
      userId,
      id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};