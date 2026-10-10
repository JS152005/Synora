import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { UpdateProfile } from "../models/userModel";

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      personalEmail: true,
      collegeEmail: true,
      profileImage: true,
      bio: true,
      college: true,
      collegeId: true,
      course: true,
      year: true,
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    ...user,
    hasVerifiedMed: Boolean(user.collegeEmailVerified && user.collegeEmail),
  };
};

export const updateProfileService = async (
  userId: string,
  profile: UpdateProfile
) => {
  const updateData: any = {};

  if (profile.fullName && profile.fullName.trim().length >= 3) {
    updateData.fullName = profile.fullName.trim();
  }

  if (typeof profile.bio === "string") {
    updateData.bio = profile.bio;
  }

  if (profile.year) {
    updateData.year = profile.year;
  }

  if (profile.collegeId) {
    const col = await prisma.college.findUnique({
      where: { id: profile.collegeId },
    });
    if (col) {
      updateData.collegeId = col.id;
      updateData.college = col.name;
    }
  } else if (profile.college && profile.college.trim()) {
    updateData.college = profile.college.trim();
    const matchedCol = await prisma.college.findFirst({
      where: { name: { equals: profile.college.trim(), mode: "insensitive" } },
    });
    if (matchedCol) {
      updateData.collegeId = matchedCol.id;
      updateData.college = matchedCol.name;
    }
  }

  if (profile.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: profile.courseId },
    });
    if (course) {
      updateData.courseId = course.id;
      updateData.course = course.code || course.name;
    }
  } else if (profile.course && profile.course.trim()) {
    updateData.course = profile.course.trim();
    const matchedCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { code: { equals: profile.course.trim(), mode: "insensitive" } },
          { name: { equals: profile.course.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (matchedCourse) {
      updateData.courseId = matchedCourse.id;
      updateData.course = matchedCourse.code || matchedCourse.name;
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      personalEmail: true,
      collegeEmail: true,
      profileImage: true,
      bio: true,
      college: true,
      collegeId: true,
      course: true,
      year: true,
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    message: "Profile Updated Successfully",
    user: {
      ...updatedUser,
      hasVerifiedMed: Boolean(updatedUser.collegeEmailVerified && updatedUser.collegeEmail),
    },
  };
};

export const searchUsersService = async (search?: string) => {
  const where: Prisma.UserWhereInput = {
    isVerified: true,
    status: "VERIFIED",
  };

  if (search && search.trim()) {
    where.fullName = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      bio: true,
      college: true,
      course: true,
      year: true,
      isVerified: true,
      collegeEmailVerified: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return users.map((u) => ({
    ...u,
    hasVerifiedMed: Boolean(u.collegeEmailVerified),
  }));
};

/* =======================================================
   Discover Users (Filtered to Verified Medical Students)
======================================================= */

export interface DiscoverUsersInput {
  currentUserId: string;
  page?: number;
  limit?: number;
  name?: string;
  subjectId?: string;
  topicId?: string;
  college?: string;
  course?: string;
  year?: string;
}

export const discoverUsersService = async (input: DiscoverUsersInput) => {
  const {
    currentUserId,
    page = 1,
    limit = 10,
    name,
    subjectId,
    topicId,
    college,
    course,
    year,
  } = input;

  const where: Prisma.UserWhereInput = {
    id: {
      not: currentUserId,
    },
    isVerified: true,
    status: "VERIFIED",
  };

  if (name) {
    where.fullName = {
      contains: name,
      mode: "insensitive",
    };
  }

  if (college) {
    where.college = {
      contains: college,
      mode: "insensitive",
    };
  }

  if (course) {
    where.course = {
      contains: course,
      mode: "insensitive",
    };
  }

  if (year) {
    where.year = year;
  }

  if (subjectId) {
    where.userTopics = {
      some: {
        topic: {
          subjectId,
        },
      },
    };
  }

  if (topicId) {
    where.userTopics = {
      some: {
        topicId,
      },
    };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        fullName: "asc",
      },
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        bio: true,
        college: true,
        course: true,
        year: true,
        isVerified: true,
        collegeEmailVerified: true,
        userTopics: {
          select: {
            type: true,
            topic: {
              select: {
                id: true,
                name: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.user.count({
      where,
    }),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    users: users.map((u) => ({
      ...u,
      hasVerifiedMed: Boolean(u.collegeEmailVerified),
    })),
  };
};

/* =======================================================
   Public Profile (Verified Only, Safe Field Projection)
======================================================= */

export const getPublicProfileService = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isVerified: true,
      status: "VERIFIED",
    },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      bio: true,
      college: true,
      course: true,
      year: true,
      isVerified: true,
      collegeEmailVerified: true,
      createdAt: true,
      userTopics: {
        select: {
          type: true,
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Student profile not found or account is not verified.");
  }

  return {
    ...user,
    hasVerifiedMed: Boolean(user.collegeEmailVerified),
  };
};

/* =======================================================
   Recommendations (Verified Only)
======================================================= */

export const getRecommendationsService = async (
  currentUserId: string,
  limit: number = 10
) => {
  const currentUserTopics = await prisma.userTopic.findMany({
    where: {
      userId: currentUserId,
    },
    select: {
      topicId: true,
    },
  });

  const topicIds = currentUserTopics.map((topic) => topic.topicId);

  if (topicIds.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId,
      },
      isVerified: true,
      status: "VERIFIED",
      userTopics: {
        some: {
          topicId: {
            in: topicIds,
          },
        },
      },
    },
    take: limit,
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      bio: true,
      college: true,
      course: true,
      year: true,
      isVerified: true,
      userTopics: {
        where: {
          topicId: {
            in: topicIds,
          },
        },
        select: {
          type: true,
          topic: {
            select: {
              id: true,
              name: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return users;
};