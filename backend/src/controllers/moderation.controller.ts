import { Request, Response } from 'express';
import { moderationService } from '../services/moderation.service';
import logger from '../utils/logger';

export const reportUser = async (req: Request, res: Response) => {
    try {
        const reporterId = (req as any).userId;
        const { reportedId, reason } = req.body;

        if (!reportedId || !reason) {
            return res.status(400).json({ message: "Données manquantes." });
        }

        await moderationService.reportUser(reporterId, reportedId, reason);
        res.json({ message: "Signalement pris en compte." });
    } catch(error) {
        logger.error('Erreur reportUser:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        const blockerId = (req as any).userId;
        const { blockedId } = req.body;

        if (!blockedId) {
             return res.status(400).json({ message: "ID manquant." });
        }

        await moderationService.blockUser(blockerId, blockedId);
        res.json({ message: "Utilisateur bloqué." });
    } catch(error) {
        logger.error('Erreur blockUser:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
