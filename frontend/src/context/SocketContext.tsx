/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../features/auth/useAuth";

interface SocketContextValue {
  socket: Socket | null;
  onlineUserIds: string[];
  isUserOnline: (userId?: string | null) => boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  onlineUserIds: [],
  isUserOnline: () => false,
  joinConversation: () => {},
  leaveConversation: () => {},
});

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("token");
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      query: { token },
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      socketInstance.emit("register", user.id);
      setSocket(socketInstance);
    });

    socketInstance.on("userOnline", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socketInstance.on("userOffline", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    });

    socketInstance.on("disconnect", () => {
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnlineUserIds([]);
    };
  }, [isAuthenticated, user?.id]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("joinConversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leaveConversation", conversationId);
  }, []);

  const isUserOnline = useCallback(
    (userId?: string | null) => {
      if (!userId) return false;
      return onlineUserIds.includes(userId);
    },
    [onlineUserIds]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUserIds,
        isUserOnline,
        joinConversation,
        leaveConversation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
