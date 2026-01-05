import { Router } from 'express';
import { getConfessions, createConfession, deleteConfession, updateConfession } from '../controllers/feed.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route pour récupérer les confessions
 * GET /api/feed
 */
router.get('/', getConfessions);

/**
 * Route pour créer une confession (Protégée)
 * POST /api/feed
 */
router.post('/', authenticate, createConfession);

/**
 * Route pour supprimer une confession (Protégée)
 * DELETE /api/feed/:id
 */
router.delete('/:id', authenticate, deleteConfession);

/**
 * Route pour modifier une confession (Protégée, limite 2 min)
 * PATCH /api/feed/:id
 */
router.patch('/:id', authenticate, updateConfession);

export default router;

// Commentaire en français :
// Ce fichier définit les routes pour le fil d'actualité (Feed).
// Il permet de récupérer la liste des confessions et d'en publier de nouvelles.
