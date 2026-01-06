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

/**
 * Upload de média (Image ou Audio) pour le chat
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }

    // Return URL
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
    
    // Suggest type based on mimetype
    const type = req.file.mimetype.startsWith('audio') ? 'AUDIO' : 'IMAGE';
    const metadata = {
        size: req.file.size,
        mimetype: req.file.mimetype,
        filename: req.file.filename
    };

    res.json({ 
        url: fileUrl, 
        type, 
        metadata 
    });

  } catch (error) {
    logger.error('Erreur uploadMedia:', error);
    res.status(500).json({ message: "Erreur lors de l'upload." });
  }
};

/**
 * Récupère les icebreakers
 */
export const getIcebreakers = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { targetUserId } = req.params;
        
        // Use MatchingService (verify import)
        // We need to import matchingService if not present. 
        // Actually matchingService is in another file, let's assume we import or use it.
        // Wait, current file imports 'messagingService'. Need to import 'matchingService'.
        const { matchingService } = await import('../services/matching.service'); 

        const suggestions = await matchingService.getIcebreakers(userId, targetUserId);
        res.json(suggestions);
    } catch (error) {
        logger.error('Erreur getIcebreakers:', error);
        res.status(500).json({ message: "Erreur suggestions." });
    }
};
