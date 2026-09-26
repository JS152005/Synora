import prisma from "../config/prisma";

export const createConversationService = async (
  userId: string,
  partnerId: string
) => {
  if (userId === partnerId) {
    throw new Error("You cannot create a conversation with yourself.");
  }

  const partner = await prisma.user.findUnique({
    where: {
      id: partnerId,
    },
  });

  if (!partner) {
    throw new Error("User not found.");
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
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
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
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
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
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
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
    throw new Error("Conversation not found.");
  }

  return conversation;
};