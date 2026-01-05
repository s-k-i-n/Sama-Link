import prisma from "../lib/prisma";

export class FeedService {
  /**
   * Récupère le flux de confessions avec filtres
   */
  async getFeed(params: { 
    filter?: 'popular' | 'nearby' | 'mine'; 
    page?: number; 
    limit?: number; 
    userId?: string 
  }) {
    const { filter, page = 1, limit = 20, userId } = params;
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };
    let where: any = {};

    switch (filter) {
      case 'popular':
        orderBy = { reactions: { _count: 'desc' } };
        break;
      case 'nearby':
        where = { location: 'Dakar' }; 
        break;
      case 'mine':
        if (userId) {
          where = { authorId: userId };
        }
        break;
    }

    return prisma.confession.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
        reactions: userId ? { where: { userId } } : false,
      },
    });
  }

  /**
   * Crée une nouvelle confession
   */
  async createConfession(data: {
    content: string;
    authorId: string;
    isAnonymous?: boolean;
    location?: string;
    imageUrl?: string;
  }) {
    return prisma.confession.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        isAnonymous: data.isAnonymous ?? true,
        location: data.location,
        imageUrl: data.imageUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Supprime une confession
   */
  async deleteConfession(id: string, authorId: string) {
    // Vérification de propriété intégrée au service
    const confession = await prisma.confession.findUnique({ where: { id } });
    if (!confession || confession.authorId !== authorId) {
      throw new Error("Non autorisé ou confession introuvable.");
    }

    return prisma.confession.delete({ where: { id } });
  }

  /**
   * Modifie une confession (Vérifie le délai et la propriété)
   */
  async updateConfession(id: string, authorId: string, content: string) {
    const confession = await prisma.confession.findUnique({ where: { id } });
    
    if (!confession || confession.authorId !== authorId) {
      throw new Error("Non autorisé ou confession introuvable.");
    }

    // Vérifier le délai de 2 minutes
    const now = new Date();
    const diff = now.getTime() - confession.createdAt.getTime();
    if (diff > 2 * 60 * 1000) {
      throw new Error("Le délai de 2 minutes est dépassé.");
    }

    return prisma.confession.update({
      where: { id },
      data: { content },
    });
  }

  /**
   * Supprime toutes les confessions d'un utilisateur
   */
  async deleteAllUserConfessions(userId: string) {
    return prisma.confession.deleteMany({
      where: { authorId: userId },
    });
  }

  /**
   * Ajoute ou supprime une réaction
   */
  async toggleReaction(confessionId: string, userId: string) {
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_confessionId: { userId, confessionId },
      },
    });

    if (existing) {
      return prisma.reaction.delete({
        where: { id: existing.id },
      });
    }

    return prisma.reaction.create({
      data: { userId, confessionId },
    });
  }
}

export const feedService = new FeedService();
