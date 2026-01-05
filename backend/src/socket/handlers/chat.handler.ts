import { Server, Socket } from "socket.io";
import { messagingService } from "../../services/messaging.service";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const registerChatHandlers = (io: Server, socket: Socket) => {
  // Rejoindre une conversation (room)
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    logger.info(`Socket ${socket.id} a rejoint la conversation ${conversationId}`);
  });

  // Envoyer un message
  socket.on("send_message", async (data: { 
    conversationId: string, 
    senderId: string, 
    receiverId: string, 
    content: string 
  }) => {
    try {
      const message = await messagingService.saveMessage(data);

      // Emettre à tous les membres de la room
      io.to(data.conversationId).emit("new_message", message);
      
      logger.info(`Message envoyé dans ${data.conversationId} par ${data.senderId}`);
    } catch (err) {
      logger.error('Erreur Socket send_message:', err);
    }
  });

  // Indicateur de saisie
  socket.on("typing", (data: { conversationId: string, username: string, isTyping: boolean }) => {
    socket.to(data.conversationId).emit("user_typing", {
      username: data.username,
      isTyping: data.isTyping
    });
  });
};
