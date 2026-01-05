import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../index';
import { swipeSchema } from '../schemas/matching.schema';

/**
 * Récupère des suggestions de profils à swiper
 */
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Récupérer les IDs des utilisateurs déjà swipés (like ou pass)
    const swipedUserIds = await prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }]
      },
      select: {
          userAId: true,
          userBId: true
      }
    });

    const excludedIds = new Set<string>();
    excludedIds.add(userId);
    swipedUserIds.forEach((m: any) => {
        excludedIds.add(m.userAId);
        excludedIds.add(m.userBId);
    });

    // Suggestions : utilisateurs actifs récents, exclus swipés
    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) }
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        avatarUrl: true
      }
    });

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

    if (userId === targetUserId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous swiper vous-même." });
    }

    // Si 'pass', on enregistre juste le refus pour ne plus suggérer
    if (direction === 'pass') {
      await prisma.match.create({
        data: {
          userAId: userId,
          userBId: targetUserId,
          status: 'passed'
        }
      });
      return res.json({ message: 'Pass enregistré.' });
    }

    // Si 'like', on vérifie si l'autre personne a déjà liké
    const existingInterest = await prisma.match.findFirst({
        where: {
            userAId: targetUserId,
            userBId: userId,
            status: 'pending' // 'pending' ici signifie que B a liké A
        }
    });

    if (existingInterest) {
        // C'est un MATCH !
        const match = await prisma.match.update({
            where: { id: existingInterest.id },
            data: { status: 'matched' }
        });
        
        logger.info(`Match créé entre ${userId} et ${targetUserId}`);
        
        return res.status(201).json({ 
            message: "C'est un match !", 
            isMatch: true,
            matchId: match.id 
        });
    }

    // Premier like, on crée une entrée pending
    await prisma.match.create({
      data: {
        userAId: userId,
        userBId: targetUserId,
        status: 'pending'
      }
    });

    res.json({ message: 'Like envoyé.', isMatch: false });

  } catch (error) {
    logger.error('Erreur handleSwipe:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du swipe.' });
  }
};
