import { Request, Response } from 'express';
import { logger } from '../index';
import { createConfessionSchema, updateConfessionSchema, getConfessionsQuerySchema } from '../schemas/feed.schema';
import { feedService } from '../services/feed.service';

/**
 * Récupérer la liste des confessions avec filtres
 */
export const getConfessions = async (req: Request, res: Response) => {
  try {
    const queryValidation = getConfessionsQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ 
        message: "Paramètres de recherche invalides.", 
        details: queryValidation.error.issues 
      });
    }

    const { filter, page, limit, userId: queryUserId } = queryValidation.data;
    const userId = queryUserId || (req as any).userId;

    const confessions = await feedService.getFeed({ filter: filter as any, page, limit, userId });

    // Reformater pour le frontend
    const formatted = confessions.map(c => {
      const imageUrl = c.imageUrl 
        ? `${req.protocol}://${req.get('host')}/${c.imageUrl.replace(/\\/g, '/')}`
        : null;

      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        location: c.location,
        authorId: c.authorId,
        imageUrl: imageUrl,
        authorAlias: c.isAnonymous ? 'Anonyme' : (c.author?.username || 'Utilisateur inconnu'),
        likes: c._count.reactions,
        commentsCount: c._count.comments,
        isLiked: Array.isArray(c.reactions) && c.reactions.length > 0 
      };
    });

    res.json(formatted);
  } catch (error) {
    logger.error('Erreur lors du chargement des confessions :', error);
    res.status(500).json({ message: 'Erreur lors du chargement des confessions.' });
  }
};

/**
 * Créer une nouvelle confession
 */
export const createConfession = async (req: Request, res: Response) => {
  try {
    const validation = createConfessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { content, location, isAnonymous: isAnonRaw } = validation.data;
    const authorId = (req as any).userId;
    const file = req.file;

    const isAnonymous = typeof isAnonRaw === 'string' ? isAnonRaw === 'true' : isAnonRaw ?? true;

    const confession = await feedService.createConfession({
      content,
      authorId,
      isAnonymous,
      location: location || 'Inconnu',
      imageUrl: file ? file.path.replace(/\\/g, '/') : undefined
    });

    logger.info(`Nouvelle confession créée par ${confession.author.username}`);

    const fullImageUrl = confession.imageUrl 
      ? `${req.protocol}://${req.get('host')}/${confession.imageUrl.replace(/\\/g, '/')}`
      : null;

    res.status(201).json({
      message: 'Confession publiée !',
      confession: {
        id: confession.id,
        content: confession.content,
        createdAt: confession.createdAt,
        authorId: confession.authorId,
        authorAlias: confession.isAnonymous ? 'Anonyme' : confession.author.username,
        imageUrl: fullImageUrl,
        likes: 0,
        commentsCount: 0
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la confession :', error);
    res.status(500).json({ message: 'Erreur lors de la publication.' });
  }
};

/**
 * Supprimer une confession
 */
export const deleteConfession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    await feedService.deleteConfession(id, userId);

    logger.info(`Confession ${id} supprimée par ${userId}`);
    res.json({ message: 'Confession supprimée avec succès.' });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de la confession :', error);
    res.status(403).json({ message: error.message || 'Erreur lors de la suppression.' });
  }
};

/**
 * Modifier une confession
 */
export const updateConfession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const validation = updateConfessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const updated = await feedService.updateConfession(id, userId, validation.data.content);

    logger.info(`Confession ${id} modifiée par ${userId}`);
    res.json({ message: 'Confession modifiée !', content: updated.content });
  } catch (error: any) {
    logger.error('Erreur lors de la modification de la confession :', error);
    res.status(400).json({ message: error.message || 'Erreur lors de la modification.' });
  }
};

/**
 * Supprimer toutes les confessions de l'utilisateur
 */
export const deleteAllMyConfessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = await feedService.deleteAllUserConfessions(userId);

    logger.info(`Toutes les confessions de l'utilisateur ${userId} ont été supprimées.`);
    res.json({ message: `${result.count} confessions supprimées.`, count: result.count });
  } catch (error) {
    logger.error('Erreur lors de la suppression groupée :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression groupée.' });
  }
};
