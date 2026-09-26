import prisma from "../config/prisma";

export const createNotificationService = async (
  userId: string,
  title: string,
  message: string,
  type: "STUDY_REQUEST" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED"
) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
};

export const getNotificationsService = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationAsReadService = async (
  userId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized.");
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
};

export const markAllNotificationsAsReadService = async (
  userId: string
) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

export const deleteNotificationService = async (
  userId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized.");
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return {
    message: "Notification deleted successfully.",
  };
};