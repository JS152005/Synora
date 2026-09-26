import prisma from "../config/prisma";
import { createNotificationService } from "./notificationService";
import { createConversationService } from "./conversationService";

export const sendStudyPartnerRequestService = async (
  senderId: string,
  receiverId: string
) => {
  if (senderId === receiverId) {
    throw new Error("You cannot send a request to yourself.");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new Error("User not found.");
  }

  const existingRequest = await prisma.studyPartnerRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existingRequest) {
    switch (existingRequest.status) {
      case "PENDING":
        throw new Error("A study partner request already exists.");

      case "ACCEPTED":
        throw new Error("You are already study partners.");

      case "REJECTED":
      case "CANCELLED":
        await prisma.studyPartnerRequest.delete({
          where: {
            id: existingRequest.id,
          },
        });
        break;
    }
  }

  const request = await prisma.studyPartnerRequest.create({
    data: {
      senderId,
      receiverId,
    },
    include: {
      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          college: true,
          course: true,
          year: true,
        },
      },
    },
  });

  await createNotificationService(
    receiverId,
    "Study Partner Request",
    "You received a new study partner request.",
    "STUDY_REQUEST"
  );

  return request;
};

export const cancelStudyPartnerRequestService = async (
  senderId: string,
  requestId: string
) => {
  const request = await prisma.studyPartnerRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.senderId !== senderId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Only pending requests can be cancelled.");
  }

  return prisma.studyPartnerRequest.update({
    where: { id: requestId },
    data: {
      status: "CANCELLED",
    },
  });
};

export const acceptStudyPartnerRequestService = async (
  receiverId: string,
  requestId: string
) => {
  const request = await prisma.studyPartnerRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.receiverId !== receiverId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request is no longer pending.");
  }

  const updatedRequest = await prisma.studyPartnerRequest.update({
    where: { id: requestId },
    data: {
      status: "ACCEPTED",
    },
  });

  // Automatically create a conversation between the two users
  await createConversationService(
    updatedRequest.senderId,
    updatedRequest.receiverId
  );

  await createNotificationService(
    updatedRequest.senderId,
    "Study Partner Request Accepted",
    "Your study partner request has been accepted.",
    "REQUEST_ACCEPTED"
  );

  return updatedRequest;
};

export const rejectStudyPartnerRequestService = async (
  receiverId: string,
  requestId: string
) => {
  const request = await prisma.studyPartnerRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.receiverId !== receiverId) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request is no longer pending.");
  }

  const updatedRequest = await prisma.studyPartnerRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
    },
  });

  await createNotificationService(
    updatedRequest.senderId,
    "Study Partner Request Rejected",
    "Your study partner request has been rejected.",
    "REQUEST_REJECTED"
  );

  return updatedRequest;
};

export const getIncomingRequestsService = async (
  userId: string
) => {
  return prisma.studyPartnerRequest.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          college: true,
          course: true,
          year: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOutgoingRequestsService = async (
  userId: string
) => {
  return prisma.studyPartnerRequest.findMany({
    where: {
      senderId: userId,
      status: "PENDING",
    },
    include: {
      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          college: true,
          course: true,
          year: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getStudyPartnersService = async (
  userId: string
) => {
  const partners = await prisma.studyPartnerRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return partners.map((partner) => {
    if (partner.senderId === userId) {
      return partner.receiver;
    }

    return partner.sender;
  });
};