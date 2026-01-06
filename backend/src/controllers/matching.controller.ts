import { Request, Response } from 'express';
import { logger } from '../index';
import { swipeSchema } from '../schemas/matching.schema';
import { matchingService } from '../services/matching.service';

/**
 * Récupère des suggestions de profils à swiper
 */
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const suggestions = await matchingService.getSuggestions(userId);
    res.json(suggestions);
  } catch (error) {
    logger.error('Erreur suggestions matching:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des suggestions.' });
  }
};

/**
 * Gère le swipe (Like ou Pass)
 */
export const handleSwipe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const validation = swipeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { targetUserId, direction } = validation.data;

    const result = await matchingService.handleSwipe(userId, targetUserId, direction);

    res.json(result);
  } catch (error: any) {
    logger.error('Erreur handleSwipe:', error);
    res.status(400).json({ message: error.message || 'Erreur lors du traitement du swipe.' });
  }
};

/**
 * Récupère les préférences de l'utilisateur
 */
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const prefs = await matchingService.getPreferences(userId);
    res.json(prefs || { minAge: 18, maxAge: 99, genderPreference: 'all', maxDistance: 50 });
  } catch (error) {
    logger.error('Erreur getPreferences:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des préférences.' });
  }
};

/**
 * Met à jour les préférences
 */
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const prefs = await matchingService.updatePreferences(userId, req.body);
    res.json(prefs);
  } catch (error) {
    logger.error('Erreur updatePreferences:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences.' });
  }
};

export const rewind = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        
        // Premium Gating
        const user = await import('../lib/prisma').then(m => m.default.user.findUnique({
             where: { id: userId }, select: { isPremium: true }
        }));

        if (!user?.isPremium) {
            return res.status(403).json({ message: "Le Rewind est une fonctionnalité Premium. 👑" });
        }

        const result = await matchingService.rewindLastSwipe(userId);
        res.json(result);
    } catch (error: any) {
        logger.error('Erreur rewind:', error);
        res.status(400).json({ message: error.message || "Impossible d'annuler la dernière action." });
    }
};

/**
 * Récupère les personnes qui ont liké le profil (Gating Premium)
 */
export const getWhoLikedMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        
        // Check Premium Status
        // We could optimize by having isPremium in the token, but db check is safer
        const user = await import('../lib/prisma').then(m => m.default.user.findUnique({
             where: { id: userId }, select: { isPremium: true }
        }));
        
        const isPremium = user?.isPremium || false;
        const likes = await matchingService.getWhoLikedMe(userId);

        if (isPremium) {
            res.json(likes);
        } else {
            // Obfuscate data for free users
            const blurred = likes.map(l => ({
                id: 'HIDDEN', // Hide ID so they can't hack it
                username: 'Quelqu\'un',
                age: l.birthDate ? new Date().getFullYear() - l.birthDate.getFullYear() : '??',
                avatarUrl: 'assets/images/blur-placeholder.jpg', // Frontend handle blur or just show this
                isBlurred: true
            }));
            res.json(blurred);
        }

    } catch(error) {
        logger.error('Erreur getWhoLikedMe:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des likes." });
    }
};
