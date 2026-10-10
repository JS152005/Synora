import prisma from "../config/prisma";

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  profileImage: true,
  college: true,
  course: true,
  year: true,
  isVerified: true,
  collegeEmailVerified: true,
  collegeEmail: true,
};

export const createConversationService = async (
  userId: string,
  partnerId: string
) => {
  if (userId === partnerId) {
    throw new Error("You cannot create a conversation with yourself.");
  }

  const partner = await prisma.user.findFirst({
    where: {
      id: partnerId,
      isVerified: true,
    },
  });

  if (!partner) {
    throw new Error("Student partner not found or account is not verified.");
  }

  // Authorization check: must have accepted study partner connection
  const isPartner = await prisma.studyPartnerRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
  });

  if (!isPartner) {
    throw new Error("Direct chat is only available between accepted study partners.");
  }

  const existingConversations = await prisma.conversation.findMany({
    where: {
      type: "DIRECT",
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: true,
    },
  });

  const existingConversation = existingConversations.find(
    (conversation) => {
      if (conversation.participants.length !== 2) {
        return false;
      }

      const participantIds = conversation.participants.map(
        (participant) => participant.userId
      );

      return (
        participantIds.includes(userId) &&
        participantIds.includes(partnerId)
      );
    }
  );

  if (existingConversation) {
    return existingConversation;
  }

  return prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [
          {
            userId,
          },
          {
            userId: partnerId,
          },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: SAFE_USER_SELECT,
          },
        },
      },
    },
  });
};

export const getConversationsService = async (
  userId: string
) => {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: SAFE_USER_SELECT,
          },
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getConversationByIdService = async (
  userId: string,
  conversationId: string
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: SAFE_USER_SELECT,
          },
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied.");
  }

  return conversation;
};