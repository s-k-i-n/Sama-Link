import { Server } from "socket.io";
import { registerChatHandlers } from "./handlers/chat.handler";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const initSocket = (io: Server) => {
  io.on("connection", (socket) => {
    logger.info(`Nouvelle connexion Socket.io : ${socket.id}`);

    // Register handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      logger.info(`Utilisateur déconnecté : ${socket.id}`);
    });
  });
};
