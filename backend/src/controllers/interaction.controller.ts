import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../index';

/**
 * Liker ou unliker une confession (Toggle)
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;
    const userId = (req as any).userId;

    if (!confessionId) {
      return res.status(400).json({ message: 'ID de la confession requis.' });
    }

    // Vérifier si le like existe déjà
    const existingLike = await prisma.reaction.findUnique({
      where: {
        userId_confessionId: { userId, confessionId }
      }
    });

    if (existingLike) {
      // Retirer le like
      await prisma.reaction.delete({
        where: {
          userId_confessionId: { userId, confessionId }
        }
      });
      return res.json({ message: 'Like retiré.', isLiked: false });
    } else {
      // Ajouter le like
      await prisma.reaction.create({
        data: { userId, confessionId, type: 'like' }
      });
      return res.status(201).json({ message: 'Confession likée !', isLiked: true });
    }
  } catch (error) {
    logger.error('Erreur lors du toggleLike :', error);
    res.status(500).json({ message: 'Erreur technique lors du like.' });
  }
};

/**
 * Ajouter un commentaire à une confession
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!confessionId || !content) {
      return res.status(400).json({ message: 'ID de la confession et contenu requis.' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        confessionId,
        content
      },
      include: {
        user: { select: { username: true, avatarUrl: true } }
      }
    });

    logger.info(`Nouveau commentaire sur la confession ${confessionId} par ${comment.user.username}`);

    res.status(201).json({
      message: 'Commentaire ajouté !',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        authorAlias: comment.user.username
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout du commentaire :', error);
    res.status(500).json({ message: 'Erreur lors de la publication du commentaire.' });
  }
};

/**
 * Récupérer les commentaires d'une confession
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { confessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { username: true, avatarUrl: true } }
      }
    });

    const formatted = comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      authorAlias: c.user.username
    }));

    res.json(formatted);
  } catch (error) {
    logger.error('Erreur lors du chargement des commentaires :', error);
    res.status(500).json({ message: 'Erreur client lors du chargement des commentaires.' });
  }
};
