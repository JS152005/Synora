import type { User } from "./user";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface StudyPartnerRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
}
