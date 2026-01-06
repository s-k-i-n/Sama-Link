import prisma from "../lib/prisma";

export class MessagingService {
  /**
   * Sauvegarde un nouveau message en base de données
   */
  async saveMessage(conversationId: string, senderId: string, content: string, type: 'TEXT' | 'IMAGE' | 'AUDIO' = 'TEXT', metadata: any = {}) {
    // Auto-Mod Check
    if (type === 'TEXT') {
        const { moderationService } = await import('./moderation.service');
        const isSafe = moderationService.checkContent(content);
        if (!isSafe) {
            throw new Error("Message contains prohibited content.");
        }
    }

    const receiverId = await this.getReceiverId(conversationId, senderId);
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        metadata
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    // Notify Receiver via Push
    try {
        const { notificationService } = await import('./notification.service');
        await notificationService.sendToUser(receiverId, {
            title: `Nouveau message de ${message.sender.username}`,
            body: type === 'TEXT' ? content : (type === 'AUDIO' ? 'Message vocal 🎤' : 'Image 📸'),
            url: `/messages/${conversationId}`
        });
    } catch (err) {
        console.error('Push notification failed:', err);
    }

    return message;
  }

  private async getReceiverId(conversationId: string, senderId: string): Promise<string> {
      // Helper to find receiver from conversation (Match) schema? 
      // Actually Message schema asks for receiverId directly. 
      // But we passed conversationId.
      // We need to fetch the match to find the other user.
      // Wait, the current implementation of saveMessage likely inferred receiverId?
      // Checking previous code... it didn't seem to calculate receiverId in the signature shown in diffs.
      // It must have been Logic: conversationId IS the matchId.
      
      const match = await prisma.match.findUnique({ where: { id: conversationId } });
      if (!match) throw new Error("Conversation failed");
      
      return match.userAId === senderId ? match.userBId : match.userAId;
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

  /**
   * Marque tous les messages d'une conversation comme lus pour un utilisateur spécifique
   */
  async markAsRead(conversationId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }
}

export const messagingService = new MessagingService();
