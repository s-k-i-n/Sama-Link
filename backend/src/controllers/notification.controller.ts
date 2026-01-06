import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import logger from '../utils/logger';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Subscription invalide." });
    }

    await notificationService.subscribe(userId, subscription);
    res.json({ message: "Abonnement aux notifications réussi." });
  } catch (error) {
    logger.error('Error in subscribe controller:', error);
    res.status(500).json({ message: "Erreur serveur lors de l'abonnement." });
  }
};

export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    await notificationService.unsubscribe(endpoint);
    res.json({ message: "Désabonnement réussi." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
