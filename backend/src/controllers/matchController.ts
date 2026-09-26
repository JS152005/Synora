import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  findHelpers,
  findLearners,
  findHelpersForTopic,
  findLearnersForTopic,
} from "../services/matchService";

/**
 * GET /match/helpers
 */
export const getHelpers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const helpers = await findHelpers(userId);

    res.status(200).json({
      success: true,
      count: helpers.length,
      data: helpers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /match/learners
 */
export const getLearners = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const learners = await findLearners(userId);

    res.status(200).json({
      success: true,
      count: learners.length,
      data: learners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /match/helpers/:topicId
 */
export const getHelpersByTopic = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topicId } = req.params;

    const helpers = await findHelpersForTopic(userId, topicId);

    res.status(200).json({
      success: true,
      count: helpers.length,
      data: helpers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /match/learners/:topicId
 */
export const getLearnersByTopic = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topicId } = req.params;

    const learners = await findLearnersForTopic(userId, topicId);

    res.status(200).json({
      success: true,
      count: learners.length,
      data: learners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};