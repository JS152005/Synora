import axiosInstance from "./axios";
import type { StudyPartnerRequest } from "../types/request";
import type { User } from "../types/user";

export const sendStudyPartnerRequest = async (
  receiverId: string
): Promise<{ success: boolean; message: string; data: StudyPartnerRequest }> => {
  const response = await axiosInstance.post("/study-partner/request", {
    receiverId,
  });
  return response.data;
};

export const cancelStudyPartnerRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string; data: StudyPartnerRequest }> => {
  const response = await axiosInstance.patch(
    `/study-partner/cancel/${requestId}`
  );
  return response.data;
};

export const acceptStudyPartnerRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string; data: StudyPartnerRequest }> => {
  const response = await axiosInstance.patch(
    `/study-partner/accept/${requestId}`
  );
  return response.data;
};

export const rejectStudyPartnerRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string; data: StudyPartnerRequest }> => {
  const response = await axiosInstance.patch(
    `/study-partner/reject/${requestId}`
  );
  return response.data;
};

export const getIncomingRequests = async (): Promise<StudyPartnerRequest[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: StudyPartnerRequest[];
  }>("/study-partner/incoming");
  return response.data.data;
};

export const getOutgoingRequests = async (): Promise<StudyPartnerRequest[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: StudyPartnerRequest[];
  }>("/study-partner/outgoing");
  return response.data.data;
};

export const getStudyPartners = async (): Promise<User[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: User[];
  }>("/study-partner/list");
  return response.data.data;
};
