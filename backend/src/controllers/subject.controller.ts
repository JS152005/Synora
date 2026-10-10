import { Request, Response } from "express";
import prisma from "../config/prisma";

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
        _count: {
          select: {
            topics: true,
          },
        },
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
    const id = req.params.id as string;

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
        _count: {
          select: {
            children: true,
          },
        },
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
 * GET /subjects/topics/:id/children
 */
export const getTopicChildren = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

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
        _count: {
          select: {
            children: true,
          },
        },
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

/**
 * GET /subjects/:id/hierarchy
 * Returns complete nested hierarchy: Subject -> Topics -> Subtopics
 */
export const getSubjectHierarchy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

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
      where: { subjectId: id },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });

    const topicMap = new Map<string, any>();
    const rootTopics: any[] = [];

    for (const t of topics) {
      topicMap.set(t.id, {
        id: t.id,
        code: t.code,
        name: t.name,
        level: t.level,
        parentTopicId: t.parentTopicId,
        children: [],
      });
    }

    for (const t of topics) {
      const node = topicMap.get(t.id);
      if (t.parentTopicId && topicMap.has(t.parentTopicId)) {
        topicMap.get(t.parentTopicId).children.push(node);
      } else {
        rootTopics.push(node);
      }
    }

    res.status(200).json({
      success: true,
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
      },
      totalTopics: topics.length,
      data: rootTopics,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch curriculum hierarchy.",
    });
  }
};