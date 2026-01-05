import { Router } from 'express';
import { getConfessions, createConfession } from '../controllers/feed.controller';

const router = Router();

/**
 * Route pour récupérer les confessions
 * GET /api/feed
 */
router.get('/', getConfessions);

/**
 * Route pour créer une confession
 * POST /api/feed
 */
router.post('/', createConfession);

export default router;

// Commentaire en français :
// Ce fichier définit les routes pour le fil d'actualité (Feed).
// Il permet de récupérer la liste des confessions et d'en publier de nouvelles.
