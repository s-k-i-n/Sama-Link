import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../index';

/**
 * Récupère la liste des conversations de l'utilisateur
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Récupérer les derniers messages reçus ou envoyés
    const lastMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['conversationId'], // Nécessite PostgreSQL
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    const conversations = lastMessages.map((msg: any) => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      return {
        id: msg.conversationId,
        partner,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unread: msg.receiverId === userId && !msg.readAt
      };
    });

    res.json(conversations);
  } catch (error) {
    logger.error('Erreur getConversations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations.' });
  }
};

/**
 * Récupère l'historique des messages d'une conversation
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).userId;

    // Note: Dans une version réelle, on vérifierait que l'utilisateur fait partie de la conversation
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
          sender: { select: { id: true, username: true } }
      }
    });

    // Marquer comme lu si nécessaire
    await prisma.message.updateMany({
        where: {
            conversationId,
            receiverId: userId,
            readAt: null
        },
        data: { readAt: new Date() }
    });

    res.json(messages);
  } catch (error) {
    logger.error('Erreur getMessages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
  }
};
