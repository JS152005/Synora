import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`✅ Socket Connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
      onlineUsers.set(userId, socket.id);

      console.log(`🟢 User Online: ${userId}`);

      io.emit("userOnline", {
        userId,
      });
    });

    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);

      console.log(
        `📥 Socket ${socket.id} joined conversation ${conversationId}`
      );
    });

    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);

      console.log(
        `📤 Socket ${socket.id} left conversation ${conversationId}`
      );
    });

    socket.on("disconnect", () => {
      let disconnectedUserId: string | null = null;

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit("userOffline", {
          userId: disconnectedUserId,
        });

        console.log(`🔴 User Offline: ${disconnectedUserId}`);
      }

      console.log(`❌ Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export const getOnlineUsers = () => onlineUsers;