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
  console.log(`Auth middleware: ${req.method} ${req.path}`);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET manquant dans les variables d\'environnement');
      return res.status(500).json({ message: 'Erreur de configuration serveur.' });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET
    ) as TokenPayload;

    console.log('Token décodé pour:', decoded.userId);

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
