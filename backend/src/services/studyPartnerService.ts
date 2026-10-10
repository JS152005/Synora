import prisma from "../config/prisma";
import { createNotificationService } from "./notificationService";
import { createConversationService } from "./conversationService";

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  profileImage: true,
  bio: true,
  college: true,
  course: true,
  year: true,
  isVerified: true,
  collegeEmailVerified: true,
  collegeEmail: true,
};

export const sendStudyPartnerRequestService = async (
  senderId: string,
  receiverId: string
) => {
  if (senderId === receiverId) {
    throw new Error("You cannot send a study partner request to yourself.");
  }

  // Ensure sender is verified
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!sender || !sender.isVerified) {
    throw new Error("Only verified medical students can send study partner requests.");
  }

  // Ensure receiver exists and is verified
  const receiver = await prisma.user.findFirst({
    where: {
      id: receiverId,
      isVerified: true,
      status: "VERIFIED",
    },
  });

  if (!receiver) {
    throw new Error("Target student not found or account is not verified.");
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
        throw new Error("A study partner request already exists with this student.");

      case "ACCEPTED":
        throw new Error("You are already connected study partners.");

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
        select: SAFE_USER_SELECT,
      },
    },
  });

  await createNotificationService(
    receiverId,
    "Study Partner Request",
    `${sender.fullName} sent you a study partner request.`,
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
    throw new Error("Unauthorized. You can only cancel your own requests.");
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
    include: {
      sender: {
        select: SAFE_USER_SELECT,
      },
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.receiverId !== receiverId) {
    throw new Error("Unauthorized. Only the recipient can accept this request.");
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

  // Automatically create mutual conversation
  await createConversationService(
    updatedRequest.senderId,
    updatedRequest.receiverId
  );

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { fullName: true },
  });

  await createNotificationService(
    updatedRequest.senderId,
    "Study Partner Request Accepted",
    `${receiver?.fullName || "Your peer"} accepted your study partner request. Direct chat is now open!`,
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
    throw new Error("Unauthorized. Only the recipient can decline this request.");
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
    "Study Partner Request Declined",
    "Your study partner request was declined.",
    "REQUEST_REJECTED"
  );

  return updatedRequest;
};

export const getIncomingRequestsService = async (userId: string) => {
  return prisma.studyPartnerRequest.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
      sender: {
        isVerified: true,
        status: "VERIFIED",
      },
    },
    include: {
      sender: {
        select: SAFE_USER_SELECT,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOutgoingRequestsService = async (userId: string) => {
  return prisma.studyPartnerRequest.findMany({
    where: {
      senderId: userId,
      status: "PENDING",
      receiver: {
        isVerified: true,
        status: "VERIFIED",
      },
    },
    include: {
      receiver: {
        select: SAFE_USER_SELECT,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getStudyPartnersService = async (userId: string) => {
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
      sender: {
        select: SAFE_USER_SELECT,
      },
      receiver: {
        select: SAFE_USER_SELECT,
      },
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