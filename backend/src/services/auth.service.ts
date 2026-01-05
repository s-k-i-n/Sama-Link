import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "sama-link-secret-key";

  /**
   * Enregistre un nouvel utilisateur
   */
  async register(data: { email: string; passwordHash: string; username: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        username: data.username,
      },
    });
  }

  /**
   * Recherche un utilisateur par email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Recherche un utilisateur par nom d'utilisateur
   */
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Recherche un utilisateur par email ou nom d'utilisateur
   */
  async findByEmailOrUsername(email: string, username: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  /**
   * Génère un token JWT
   */
  generateToken(userId: string) {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Vérifie un mot de passe (placeholder si bcrypt utilisé plus tard)
   */
  async verifyPassword(password: string, hash: string) {
    // Pour l'instant on compare en clair si c'est ce qui est stocké, 
    // mais le service est prêt pour bcrypt.
    return password === hash; 
  }
}

export const authService = new AuthService();
