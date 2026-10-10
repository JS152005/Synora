export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";
export type ConversationType = "DIRECT" | "GROUP";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status: MessageStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    profileImage?: string | null;
  };
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string | null;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessageId?: string | null;
  lastMessage?: {
    id: string;
    content: string | null;
    createdAt: string;
    sender?: {
      id: string;
      fullName: string;
    };
  } | null;
}
