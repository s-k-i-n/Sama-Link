import { Router } from 'express';
import { toggleLike, addComment, getComments } from '../controllers/interaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Liker/Unliker une confession
 * POST /api/interactions/:confessionId/like
 */
router.post('/:confessionId/like', authenticate, toggleLike);

/**
 * Ajouter un commentaire
 * POST /api/interactions/:confessionId/comment
 */
router.post('/:confessionId/comment', authenticate, addComment);

/**
 * Récupérer les commentaires d'une confession
 * GET /api/interactions/:confessionId/comments
 */
router.get('/:confessionId/comments', getComments);

export default router;

// Commentaire en français :
// Ce fichier gère les interactions sociales (likes, commentaires).
// Les actions d'écriture (POST) sont protégées par le middleware d'authentification.
