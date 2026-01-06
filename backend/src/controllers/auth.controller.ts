import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { logger } from '../index';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

/**
 * Inscription d'un nouvel utilisateur
 */
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

    const { email, phone, password, username } = validation.data;

    // Vérifier si l'utilisateur existe déjà (email, phone ou username)
    const existingUser = await authService.findByEmailOrPhoneOrUsername(email, phone, username);
    if (existingUser) {
      if (existingUser.email === email && email) return res.status(400).json({ message: 'Email déjà utilisé.' });
      if (existingUser.phone === phone && phone) return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé.' });
      if (existingUser.username === username) return res.status(400).json({ message: 'Nom d\'utilisateur déjà pris.' });
    }

    // Hashage du mot de passe
    const passwordHash = await authService.hashPassword(password);

    // Création de l'utilisateur
    const user = await authService.register({ email, phone, username, passwordHash });

    logger.info(`Nouvel utilisateur inscrit : ${username} (${email || phone})`);

    // Génération du token JWT
    const token = authService.generateToken(user.id);

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
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

    const { identifier, password } = validation.data;

    // Recherche par email, téléphone ou username
    const user = await authService.findByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    // Vérification du mot de passe
    const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
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
        phone: user.phone,
        username: user.username,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la connexion.' });
  }
};
