import { PrismaClient, UserTopicType } from "@prisma/client";

const prisma = new PrismaClient();

export const addUserTopic = async (
  userId: string,
  topicId: string,
  type: UserTopicType
) => {
  // Check if topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new Error("Topic not found.");
  }

  // Prevent duplicate selection
  const existing = await prisma.userTopic.findUnique({
    where: {
      userId_topicId_type: {
        userId,
        topicId,
        type,
      },
    },
  });

  if (existing) {
    throw new Error("Topic already added.");
  }

  return prisma.userTopic.create({
    data: {
      userId,
      topicId,
      type,
    },
    include: {
      topic: {
        select: {
          id: true,
          code: true,
          name: true,
          level: true,
        },
      },
    },
  });
};

export const getUserTopics = async (userId: string) => {
  const topics = await prisma.userTopic.findMany({
    where: {
      userId,
    },
    include: {
      topic: {
        select: {
          id: true,
          code: true,
          name: true,
          level: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    learning: topics.filter((t) => t.type === UserTopicType.LEARNING),
    canHelp: topics.filter((t) => t.type === UserTopicType.CAN_HELP),
  };
};

export const deleteUserTopic = async (
  userId: string,
  topicId: string,
  type: UserTopicType
) => {
  return prisma.userTopic.delete({
    where: {
      userId_topicId_type: {
        userId,
        topicId,
        type,
      },
    },
  });
};