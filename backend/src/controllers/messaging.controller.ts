import { Request, Response } from 'express';
import { messagingService } from '../services/messaging.service';
import { logger } from '../index';

/**
 * Récupère la liste des conversations de l'utilisateur
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const conversations = await messagingService.getConversations(userId);
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
    const messages = await messagingService.getMessages(conversationId, userId);
    res.json(messages);
  } catch (error) {
    logger.error('Erreur getMessages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
  }
};
