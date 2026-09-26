import { Request, Response } from "express";
import {
  sendMessageService,
  getMessagesService,
  markConversationAsReadService,
  deleteMessageService,
} from "../services/messageService";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { conversationId, content, type } = req.body;

    const message = await sendMessageService(
      senderId,
      conversationId,
      content,
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    const messages = await getMessagesService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const markConversationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    await markConversationAsReadService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      message: "Conversation marked as read.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;

    const message = await deleteMessageService(
      userId,
      messageId
    );

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};