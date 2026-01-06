import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import logger from '../utils/logger';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { plan } = req.body;
    
    if (!['GOLD', 'PLATINUM'].includes(plan)) {
      return res.status(400).json({ message: "Plan invalide." });
    }

    const result = await subscriptionService.subscribe(userId, plan);
    res.json({ message: `Félicitations ! Vous êtes maintenant membre ${plan}. 👑`, user: result });
  } catch (error: any) {
    logger.error('Erreur subscribe:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const status = await subscriptionService.getStatus(userId);
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
