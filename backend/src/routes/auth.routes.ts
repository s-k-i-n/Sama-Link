import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

/**
 * Route pour l'inscription
 * POST /api/auth/register
 */
router.post('/register', register);

/**
 * Route pour la connexion
 * POST /api/auth/login
 */
router.post('/login', login);

export default router;

// Commentaire en français :
// Ce fichier définit les routes liées à l'authentification.
// Chaque route est liée à une méthode spécifique du contrôleur auth.
