import prisma from "../lib/prisma";

export class InteractionService {
  /**
   * Ajoute ou supprime un like (Toggle)
   */
  async toggleLike(confessionId: string, userId: string) {
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_confessionId: { userId, confessionId },
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return { isLiked: false };
    }

    await prisma.reaction.create({
      data: { userId, confessionId, type: "like" },
    });
    return { isLiked: true };
  }

  /**
   * Ajoute un commentaire
   */
  async addComment(confessionId: string, userId: string, content: string) {
    return prisma.comment.create({
      data: {
        userId,
        confessionId,
        content,
      },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
    });
  }

  /**
   * Récupère les commentaires d'une confession
   */
  async getComments(confessionId: string) {
    return prisma.comment.findMany({
      where: { confessionId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
    });
  }
}

export const interactionService = new InteractionService();
