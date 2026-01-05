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
        // Nécessite authentification (sera géré par middleware plus tard)
        // Pour le moment on mock ou on demande un userId dans le query
        const userId = req.body.userId || req.query.userId;
        if (userId) where = { authorId: userId };
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
    const formatted = confessions.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      location: c.location,
      authorAlias: c.isAnonymous ? 'Anonyme' : c.author.username,
      likes: c._count.reactions,
      commentsCount: c._count.comments,
      isLiked: false // Sera calculé dynamiquement par utilisateur connecté
    }));

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

    if (!content || !authorId) {
      return res.status(400).json({ message: 'Le contenu est requis.' });
    }

    const confession = await prisma.confession.create({
      data: {
        content,
        location: location || 'Inconnu',
        isAnonymous: isAnonymous ?? true,
        authorId
      },
      include: {
        author: { select: { username: true } }
      }
    });

    logger.info(`Nouvelle confession créée par ${confession.author.username}`);

    res.status(201).json({
      message: 'Confession publiée !',
      confession: {
        id: confession.id,
        content: confession.content,
        createdAt: confession.createdAt,
        authorAlias: confession.isAnonymous ? 'Anonyme' : confession.author.username,
        likes: 0,
        commentsCount: 0
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la confession :', error);
    res.status(500).json({ message: 'Erreur lors de la publication.' });
  }
};
