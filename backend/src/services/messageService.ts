import prisma from "../config/prisma";
import { getIO } from "../socket";

export const sendMessageService = async (
  senderId: string,
  conversationId: string,
  content: string,
  type: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO" = "TEXT"
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: senderId,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      type,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageId: message.id,
    },
  });







// ===== Socket.IO =====





const io = getIO();

io.to(conversationId).emit("newMessage", message);

const updatedConversation = await prisma.conversation.findUnique({
  where: {
    id: conversationId,
  },
  include: {
    participants: {
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            email: true,
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

io.to(conversationId).emit(
  "conversationUpdated",
  updatedConversation
);

return message;









  

  // ===== Socket.IO =====

  
};

export const getMessagesService = async (
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
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  return prisma.message.findMany({
    where: {
      conversationId,
      isDeleted: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const markConversationAsReadService = async (
  userId: string,
  conversationId: string
) => {
  const participant =
    await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

  if (!participant) {
    throw new Error("Conversation not found.");
  }

  return prisma.conversationParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      lastReadAt: new Date(),
    },
  });
};

export const deleteMessageService = async (
  userId: string,
  messageId: string
) => {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) {
    throw new Error("Message not found.");
  }

  if (message.senderId !== userId) {
    throw new Error("Unauthorized.");
  }

  return prisma.message.update({
    where: {
      id: messageId,
    },
    data: {
      isDeleted: true,
      content: "This message was deleted.",
    },
  });
};