import { Request, Response } from "express";
import {
  createConversationService,
  getConversationsService,
  getConversationByIdService,
} from "../services/conversationService";

export const createConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { partnerId } = req.body;

    const conversation = await createConversationService(
      userId,
      partnerId
    );

    res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: conversation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await getConversationsService(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConversationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await getConversationByIdService(
      userId,
      id
    );

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};