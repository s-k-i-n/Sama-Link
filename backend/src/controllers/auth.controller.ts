import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { logger } from '../index';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: validation.error.issues[0].message,
        details: validation.error.issues 
      });
    }

    const { email, password, username } = validation.data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await authService.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'Email ou nom d\'utilisateur déjà utilisé.' });
    }

    // Hashage du mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Création de l'utilisateur
    const user = await authService.register({ email, username, passwordHash });

    logger.info(`Nouvel utilisateur inscrit : ${username} (${email})`);

    // Génération du token JWT
    const token = authService.generateToken(user.id);

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de l\'inscription.' });
  }
};

/**
 * Connexion d'un utilisateur existant
 */
export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { email, password } = validation.data;

    const user = await authService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    // Génération du token JWT
    const token = authService.generateToken(user.id);

    logger.info(`Utilisateur connecté : ${user.username}`);

    res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la connexion.' });
  }
};
