import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  sendMessageService,
  getMessagesService,
  markConversationAsReadService,
  deleteMessageService,
} from "../services/messageService";

export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { conversationId, content, text, type } = req.body;
    const messageContent = content || text;

    const message = await sendMessageService(
      senderId,
      conversationId,
      messageContent,
      type
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;

    const messages = await getMessagesService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markConversationAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;

    const result = await markConversationAsReadService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      message: "Conversation marked as read.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const messageId = req.params.messageId as string;

    const result = await deleteMessageService(
      userId,
      messageId
    );

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};