import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /subjects
 */
export const getSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects.",
    });
  }
};

/**
 * GET /subjects/:id/topics
 * Returns only root topics of a subject.
 */
export const getSubjectTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
      return;
    }

    const topics = await prisma.topic.findMany({
      where: {
        subjectId: id,
        parentTopicId: null,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
      },
    });

    res.status(200).json({
      success: true,
      subject,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch subject topics.",
    });
  }
};

/**
 * GET /topics/:id/children
 */
export const getTopicChildren = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const children = await prisma.topic.findMany({
      where: {
        parentTopicId: id,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
      },
    });

    res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch child topics.",
    });
  }
};