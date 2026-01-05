import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../index';

/**
 * Récupérer la liste des confessions avec filtres
 */
export const getConfessions = async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;
    
    // Logique de tri/filtrage
    let orderBy: any = { createdAt: 'desc' };
    let where: any = {};

    switch (filter) {
      case 'popular':
        // Pour simplifier, on trie par nombre de likes (on devra compter les relations dans un cas réel plus complexe)
        orderBy = { reactions: { _count: 'desc' } };
        break;
      case 'nearby':
        // Mock : Dans une vraie app, on utiliserait GeoSpatial queries
        where = { location: 'Dakar' }; 
        break;
      case 'mine':
        console.log('Filtre "mine" détecté. Query:', req.query);
        // On récupère le userId de la query (depuis FeedService)
        const userId = req.query?.userId as string;
        if (userId) {
          where = { authorId: userId };
          console.log('Filtrage par authorId:', userId);
        } else {
          console.warn('Filtre "mine" demandé mais aucun userId fourni.');
        }
        break;
    }

    const confessions = await prisma.confession.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: { username: true, avatarUrl: true }
        },
        _count: {
          select: { reactions: true, comments: true }
        }
      }
    });

    // Reformater pour le frontend
    const formatted = confessions.map(c => {
      try {
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
          isLiked: false 
        };
      } catch (err) {
        console.error('Erreur formatage confession:', c.id, err);
        return null;
      }
    }).filter(c => c !== null);

    if (formatted.length > 0) {
      console.log(`Renvoyé ${formatted.length} confessions.`);
    }

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
    const { content, location, isAnonymous } = req.body;
    const authorId = (req as any).userId;
    const file = req.file;

    if (!content || !authorId) {
      return res.status(400).json({ message: 'Le contenu est requis.' });
    }

    const confession = await prisma.confession.create({
      data: {
        content,
        location: location || 'Inconnu',
        isAnonymous: typeof isAnonymous === 'string' ? isAnonymous === 'true' : isAnonymous ?? true,
        authorId,
        imageUrl: file ? file.path : null
      },
      include: {
        author: { select: { username: true } }
      }
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
    console.log(`Tentative de suppression: ID=${id}, UserID=${userId}`);

    const confession = await prisma.confession.findUnique({
      where: { id }
    });

    if (!confession) {
      return res.status(404).json({ message: 'Confession non trouvée.' });
    }

    if (confession.authorId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas l\'auteur de cette confession.' });
    }

    await prisma.confession.delete({
      where: { id }
    });

    logger.info(`Confession ${id} supprimée par ${userId}`);
    res.json({ message: 'Confession supprimée avec succès.' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la confession :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

/**
 * Modifier une confession (Limite 2 minutes)
 */
export const updateConfession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;
    console.log(`Tentative de modification: ID=${id}, UserID=${userId}`);

    const confession = await prisma.confession.findUnique({
      where: { id }
    });

    if (!confession) {
      return res.status(404).json({ message: 'Confession non trouvée.' });
    }

    if (confession.authorId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas l\'auteur de cette confession.' });
    }

    // Vérifier le délai de 2 minutes (120000 ms)
    const now = new Date();
    const diff = now.getTime() - confession.createdAt.getTime();
    if (diff > 2 * 60 * 1000) {
      return res.status(400).json({ message: 'Le délai de 2 minutes pour modifier cette confession est dépassé.' });
    }

    const updated = await prisma.confession.update({
      where: { id },
      data: { content }
    });

    logger.info(`Confession ${id} modifiée par ${userId}`);
    res.json({ message: 'Confession modifiée !', content: updated.content });
  } catch (error) {
    logger.error('Erreur lors de la modification de la confession :', error);
    res.status(500).json({ message: 'Erreur lors de la modification.' });
  }
};
/**
 * Supprimer toutes les confessions de l'utilisateur connecté
 */
export const deleteAllMyConfessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }

    const result = await prisma.confession.deleteMany({
      where: { authorId: userId }
    });

    logger.info(`Toutes les confessions (${result.count}) de l'utilisateur ${userId} ont été supprimées.`);
    res.json({ message: `${result.count} confessions supprimées.`, count: result.count });
  } catch (error) {
    logger.error('Erreur lors de la suppression groupée :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression groupée.' });
  }
};
