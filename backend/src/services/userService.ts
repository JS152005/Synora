import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { UpdateProfile } from "../models/userModel";

export const getMeService = async (userId: string) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
            bio: true,
            college: true,
            course: true,
            year: true,
            createdAt: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const updateProfileService = async (
    userId: string,
    profile: UpdateProfile
) => {

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            fullName: profile.fullName,
            bio: profile.bio,
            college: profile.college,
            course: profile.course,
            year: profile.year
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
            bio: true,
            college: true,
            course: true,
            year: true,
            createdAt: true
        }
    });

    return {
        message: "Profile Updated Successfully",
        user: updatedUser
    };
};

export const searchUsersService = async (
    search?: string
) => {

    return prisma.user.findMany({
        where: search
            ? {
                  fullName: {
                      contains: search,
                      mode: "insensitive"
                  }
              }
            : { },

        select: {
            id: true,
            fullName: true,
            profileImage: true,
            bio: true,
            college: true,
            course: true,
            year: true
        },

        orderBy: {
            fullName: "asc"
        }
    });
};

/* =======================================================
   Discover Users
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

/* =======================================================
   Discover Users
======================================================= */

export const discoverUsersService = async (
    input: DiscoverUsersInput
) => {

    const {
        currentUserId,
        page = 1,
        limit = 10,
        name,
        subjectId,
        topicId,
        college,
        course,
        year
    } = input;

    const where: Prisma.UserWhereInput = {

        id: {
            not: currentUserId
        }

    };

    if (name) {

        where.fullName = {
            contains: name,
            mode: "insensitive"
        };

    }

    if (college) {

        where.college = {
            contains: college,
            mode: "insensitive"
        };

    }

    if (course) {

        where.course = {
            contains: course,
            mode: "insensitive"
        };

    }

    if (year) {

        where.year = year;

    }

    if (subjectId) {

        where.userTopics = {

            some: {

                topic: {

                    subjectId

                }

            }

        };

    }

    if (topicId) {

        where.userTopics = {

            some: {

                topicId

            }

        };

    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([

        prisma.user.findMany({
            where,

            skip,

            take: limit,

            orderBy: {
                fullName: "asc"
            },

            select: {
                id: true,
                fullName: true,
                profileImage: true,
                bio: true,
                college: true,
                course: true,
                year: true,

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
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }),

        prisma.user.count({
            where
        })
    ]);

    return {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),

        users
    };
};

/* =======================================================
   Public Profile
======================================================= */

export const getPublicProfileService = async (
    userId: string
) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },

        select: {
            id: true,
            fullName: true,
            profileImage: true,
            bio: true,
            college: true,
            course: true,
            year: true,

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
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;

};

/* =======================================================
   Recommendations
======================================================= */

export const getRecommendationsService = async (
    currentUserId: string,
    limit: number = 10
) => {

    const currentUserTopics =
        await prisma.userTopic.findMany({
            where: {
                userId: currentUserId
            },

            select: {
                topicId: true
            }
        });

    const topicIds =
        currentUserTopics.map(
            topic => topic.topicId
        );

    if (topicIds.length === 0) {

        return [];

    }

    const users =
        await prisma.user.findMany({
            where: {
                id: {
                    not: currentUserId
                },

                userTopics: {
                    some: {
                        topicId: {
                            in: topicIds
                        }
                    }
                }
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

                userTopics: {
                    where: {
                        topicId: {
                            in: topicIds
                        }
                    },

                    select: {
                        topic: {
                            select: {
                                id: true,
                                name: true,

                                subject: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

    return users;

};