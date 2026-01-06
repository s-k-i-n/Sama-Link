import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "sama-link-secret-key";

  /**
   * Enregistre un nouvel utilisateur
   */
  /**
   * Enregistre un nouvel utilisateur
   */
  async register(data: { email?: string; phone?: string; passwordHash: string; username: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
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
   * Recherche un utilisateur par téléphone
   */
  async findByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
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
   * Recherche un utilisateur par identifiant (email, téléphone ou username)
   */
  async findByIdentifier(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier }
        ],
      },
    });
  }

  /**
   * Recherche un utilisateur par email, téléphone ou nom d'utilisateur (pour vérification existence)
   */
  async findByEmailOrPhoneOrUsername(email: string | undefined, phone: string | undefined, username: string) {
    const conditions: any[] = [{ username }];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    return prisma.user.findFirst({
      where: {
        OR: conditions,
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
   * Hash un mot de passe
   */
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Vérifie un mot de passe
   */
  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}

export const authService = new AuthService();
