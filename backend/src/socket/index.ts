import { Server } from "socket.io";
import { registerChatHandlers } from "./handlers/chat.handler";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export const initSocket = (io: Server) => {
  // Middleware d'authentification Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) return next(new Error("Authentication error: No token provided"));

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret') as any;
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId;
    logger.info(`Utilisateur connecté : ${userId} (Socket: ${socket.id})`);

    // Update status to online
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true, lastSeen: new Date() }
        });
        io.emit("user_status_change", { userId, isOnline: true });
    } catch (err) {
        logger.error(`Erreur update status online: ${err}`);
    }

    // Register handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", async () => {
      logger.info(`Utilisateur déconnecté : ${userId}`);
      
      try {
          await prisma.user.update({
              where: { id: userId },
              data: { isOnline: false, lastSeen: new Date() }
          });
          io.emit("user_status_change", { userId, isOnline: false, lastSeen: new Date() });
      } catch (err) {
          logger.error(`Erreur update status offline: ${err}`);
      }
    });
  });
};
