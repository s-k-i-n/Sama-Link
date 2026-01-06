import prisma from "../lib/prisma";

export class MessagingService {
  /**
   * Sauvegarde un nouveau message en base de données
   */
  async saveMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type?: string; 
    metadata?: any;
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        type: data.type || 'TEXT',
        metadata: data.metadata || {}
      },
      include: {
        sender: { select: { username: true, avatarUrl: true } },
      },
    });
  }

  /**
   * Récupère les conversations d'un utilisateur
   */
  async getConversations(userId: string) {
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    // Groupement par conversationId et récupération du dernier message
    const conversationsMap = new Map();
    conversations.forEach((msg: any) => {
      if (!conversationsMap.has(msg.conversationId)) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationsMap.set(msg.conversationId, {
          id: msg.conversationId,
          otherUser,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
          unreadCount: 0,
        });
      }
    });

    return Array.from(conversationsMap.values());
  }

  /**
   * Récupère les messages d'une conversation
   */
  async getMessages(conversationId: string, userId: string) {
    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { username: true } },
      },
    });
  }
}

export const messagingService = new MessagingService();
