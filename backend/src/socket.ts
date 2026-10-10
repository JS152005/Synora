import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "./config/prisma";

let io: Server;

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.query?.token as string) ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        // Allow unauthenticated connection but with restricted access
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string; email: string };

      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      // Token expired or invalid
      next();
    }
  });

  io.on("connection", (socket: Socket) => {
    const currentUserId = socket.data.userId;

    if (currentUserId) {
      onlineUsers.set(currentUserId, socket.id);
      socket.join(`user:${currentUserId}`);
      io.emit("userOnline", { userId: currentUserId });
    }

    socket.on("register", (userId: string) => {
      // If authenticated socket matches or client registers
      const effectiveUserId = socket.data.userId || userId;
      if (effectiveUserId) {
        socket.data.userId = effectiveUserId;
        onlineUsers.set(effectiveUserId, socket.id);
        socket.join(`user:${effectiveUserId}`);
        io.emit("userOnline", { userId: effectiveUserId });
      }
    });

    // Secure conversation room joining with participant authorization check
    socket.on("joinConversation", async (conversationId: string) => {
      const userId = socket.data.userId;

      if (!userId) {
        socket.emit("error", {
          message: "Authentication required to join conversation rooms.",
        });
        return;
      }

      try {
        const isParticipant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId,
            userId,
          },
        });

        if (!isParticipant) {
          socket.emit("error", {
            message: "Unauthorized. You are not a participant in this conversation.",
          });
          return;
        }

        socket.join(conversationId);
      } catch (err) {
        console.error("Socket join error:", err);
      }
    });

    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);
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
      }
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