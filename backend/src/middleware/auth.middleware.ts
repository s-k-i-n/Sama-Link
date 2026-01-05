import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../index';

interface TokenPayload {
  userId: string;
}

/**
 * Middleware pour protéger les routes nécessitant une authentification
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_temporaire'
    ) as TokenPayload;

    // Ajouter l'ID de l'utilisateur à l'objet request pour les contrôleurs suivants
    (req as any).userId = decoded.userId;
    
    next();
  } catch (error) {
    logger.error('Erreur de validation du token JWT :', error);
    return res.status(401).json({ message: 'Session expirée ou token invalide.' });
  }
};

// Commentaire en français :
// Ce middleware vérifie la présence et la validité du token JWT dans le header Authorization.
// S'il est valide, il extrait le userId et l'attache à la requête.
