import { Request, Response } from 'express';
import { logger } from '../index';
import { interactionService } from '../services/interaction.service';

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

    const result = await interactionService.toggleLike(confessionId, userId);
    res.json({ message: result.isLiked ? 'Confession likée !' : 'Like retiré.', ...result });
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

    const comment = await interactionService.addComment(confessionId, userId, content);

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
    const comments = await interactionService.getComments(confessionId);

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
