import { Request, Response } from "express";
import {
  sendStudyPartnerRequestService,
  cancelStudyPartnerRequestService,
  acceptStudyPartnerRequestService,
  rejectStudyPartnerRequestService,
  getIncomingRequestsService,
  getOutgoingRequestsService,
  getStudyPartnersService,
} from "../services/studyPartnerService";

export const sendStudyPartnerRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverId } = req.body;

    const request = await sendStudyPartnerRequestService(
      senderId,
      receiverId
    );

    res.status(201).json({
      success: true,
      message: "Study partner request sent successfully.",
      data: request,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelStudyPartnerRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { requestId } = req.params;

    const request = await cancelStudyPartnerRequestService(
      senderId,
      requestId
    );

    res.status(200).json({
      success: true,
      message: "Study partner request cancelled successfully.",
      data: request,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const acceptStudyPartnerRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const receiverId = req.user!.id;
    const { requestId } = req.params;

    const request = await acceptStudyPartnerRequestService(
      receiverId,
      requestId
    );

    res.status(200).json({
      success: true,
      message: "Study partner request accepted successfully.",
      data: request,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectStudyPartnerRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const receiverId = req.user!.id;
    const { requestId } = req.params;

    const request = await rejectStudyPartnerRequestService(
      receiverId,
      requestId
    );

    res.status(200).json({
      success: true,
      message: "Study partner request rejected successfully.",
      data: request,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getIncomingRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const requests = await getIncomingRequestsService(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOutgoingRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const requests = await getOutgoingRequestsService(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudyPartners = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const partners = await getStudyPartnersService(userId);

    res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};