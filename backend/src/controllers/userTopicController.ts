import { Request, Response } from "express";
import { UserTopicType } from "@prisma/client";
import {
  addUserTopic,
  getUserTopics,
  deleteUserTopic,
} from "../services/userTopicService";

export const createUserTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { topicId, type } = req.body;

    if (!topicId || !type) {
      res.status(400).json({
        success: false,
        message: "topicId and type are required.",
      });
      return;
    }

    if (
      type !== UserTopicType.LEARNING &&
      type !== UserTopicType.CAN_HELP
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid topic type.",
      });
      return;
    }

    const result = await addUserTopic(userId, topicId, type);

    res.status(201).json({
      success: true,
      message: "Topic added successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const result = await getUserTopics(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeUserTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { topicId, type } = req.params;

    if (
      type !== UserTopicType.LEARNING &&
      type !== UserTopicType.CAN_HELP
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid topic type.",
      });
      return;
    }

    await deleteUserTopic(
      userId,
      topicId,
      type as UserTopicType
    );

    res.status(200).json({
      success: true,
      message: "Topic removed successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};