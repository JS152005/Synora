import { PrismaClient, UserTopicType } from "@prisma/client";
import prisma from "../config/prisma";

type MatchUser = {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  isVerified: boolean;
};

type MatchTopic = {
  id: string;
  code: string;
  name: string;
  level: number;
};

type MatchResult = {
  user: MatchUser;
  matchedTopics: MatchTopic[];
  matchPercentage: number;
};

const buildMatches = async (
  userId: string,
  myType: UserTopicType,
  targetType: UserTopicType
): Promise<MatchResult[]> => {
  // Find topics for current user
  const myTopics = await prisma.userTopic.findMany({
    where: {
      userId,
      type: myType,
    },
    include: {
      topic: true,
    },
  });

  if (!myTopics.length) return [];

  const topicIds = myTopics.map((t) => t.topicId);

  // Match only with other verified medical students sharing exact topic IDs
  const matches = await prisma.userTopic.findMany({
    where: {
      topicId: {
        in: topicIds,
      },
      type: targetType,
      NOT: {
        userId,
      },
      user: {
        isVerified: true,
        status: "VERIFIED",
      },
    },
    include: {
      topic: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          bio: true,
          college: true,
          course: true,
          year: true,
          isVerified: true,
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      user: MatchUser;
      matchedTopics: MatchTopic[];
    }
  >();

  for (const match of matches) {
    // Prevent self-matching
    if (match.userId === userId) continue;

    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      // Prevent duplicate topics in list
      if (!existing.matchedTopics.some((t) => t.id === match.topic.id)) {
        existing.matchedTopics.push(match.topic);
      }
    }
  }

  const results: MatchResult[] = [];

  for (const value of grouped.values()) {
    const percentage = Math.min(
      100,
      Math.round((value.matchedTopics.length / myTopics.length) * 100)
    );

    results.push({
      user: value.user,
      matchedTopics: value.matchedTopics,
      matchPercentage: percentage,
    });
  }

  results.sort(
    (a, b) =>
      b.matchPercentage - a.matchPercentage ||
      b.matchedTopics.length - a.matchedTopics.length
  );

  return results;
};

export const findHelpers = async (userId: string) => {
  return buildMatches(
    userId,
    UserTopicType.LEARNING,
    UserTopicType.CAN_HELP
  );
};

export const findLearners = async (userId: string) => {
  return buildMatches(
    userId,
    UserTopicType.CAN_HELP,
    UserTopicType.LEARNING
  );
};

export const findHelpersForTopic = async (
  userId: string,
  topicId: string
) => {
  const matches = await prisma.userTopic.findMany({
    where: {
      topicId,
      type: UserTopicType.CAN_HELP,
      NOT: {
        userId,
      },
      user: {
        isVerified: true,
        status: "VERIFIED",
      },
    },
    include: {
      topic: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          bio: true,
          college: true,
          course: true,
          year: true,
          isVerified: true,
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      user: MatchUser;
      matchedTopics: MatchTopic[];
    }
  >();

  for (const match of matches) {
    if (match.userId === userId) continue;

    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      if (!existing.matchedTopics.some((t) => t.id === match.topic.id)) {
        existing.matchedTopics.push(match.topic);
      }
    }
  }

  return Array.from(grouped.values()).map((item) => ({
    user: item.user,
    matchedTopics: item.matchedTopics,
    matchPercentage: 100,
  }));
};

export const findLearnersForTopic = async (
  userId: string,
  topicId: string
) => {
  const matches = await prisma.userTopic.findMany({
    where: {
      topicId,
      type: UserTopicType.LEARNING,
      NOT: {
        userId,
      },
      user: {
        isVerified: true,
        status: "VERIFIED",
      },
    },
    include: {
      topic: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          bio: true,
          college: true,
          course: true,
          year: true,
          isVerified: true,
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      user: MatchUser;
      matchedTopics: MatchTopic[];
    }
  >();

  for (const match of matches) {
    if (match.userId === userId) continue;

    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      if (!existing.matchedTopics.some((t) => t.id === match.topic.id)) {
        existing.matchedTopics.push(match.topic);
      }
    }
  }

  return Array.from(grouped.values()).map((item) => ({
    user: item.user,
    matchedTopics: item.matchedTopics,
    matchPercentage: 100,
  }));
};