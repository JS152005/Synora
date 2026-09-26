import { PrismaClient, UserTopicType } from "@prisma/client";

const prisma = new PrismaClient();

type MatchUser = {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
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

  const matches = await prisma.userTopic.findMany({
    where: {
      topicId: {
        in: topicIds,
      },
      type: targetType,
      NOT: {
        userId,
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
    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      existing.matchedTopics.push(match.topic);
    }
  }

  const results: MatchResult[] = [];

  for (const value of grouped.values()) {
    const percentage = Math.round(
      (value.matchedTopics.length / myTopics.length) * 100
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
    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      existing.matchedTopics.push(match.topic);
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
    const existing = grouped.get(match.userId);

    if (!existing) {
      grouped.set(match.userId, {
        user: match.user,
        matchedTopics: [match.topic],
      });
    } else {
      existing.matchedTopics.push(match.topic);
    }
  }

  return Array.from(grouped.values()).map((item) => ({
    user: item.user,
    matchedTopics: item.matchedTopics,
    matchPercentage: 100,
  }));
};