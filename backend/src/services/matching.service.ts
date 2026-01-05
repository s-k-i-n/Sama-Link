import prisma from "../lib/prisma";

export class MatchingService {
  /**
   * Récupère des suggestions de profils
   */
  async getSuggestions(userId: string, limit: number = 20) {
    // Récupérer les IDs des utilisateurs déjà swipés
    const swipedUserIds = await prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      select: {
        userAId: true,
        userBId: true,
      },
    });

    const excludedIds = new Set<string>();
    excludedIds.add(userId);
    swipedUserIds.forEach((m) => {
      excludedIds.add(m.userAId);
      excludedIds.add(m.userBId);
    });

    return prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        avatarUrl: true,
      },
    });
  }

  /**
   * Gère le swipe (Like/Pass)
   */
  async handleSwipe(userId: string, targetUserId: string, direction: "like" | "pass") {
    if (userId === targetUserId) {
      throw new Error("Vous ne pouvez pas vous swiper vous-même.");
    }

    if (direction === "pass") {
      return prisma.match.create({
        data: {
          userAId: userId,
          userBId: targetUserId,
          status: "passed",
        },
      });
    }

    // Si 'like', vérifier la réciprocité
    const existingInterest = await prisma.match.findFirst({
      where: {
        userAId: targetUserId,
        userBId: userId,
        status: "pending",
      },
    });

    if (existingInterest) {
      // C'est un MATCH !
      const match = await prisma.match.update({
        where: { id: existingInterest.id },
        data: { status: "matched" },
      });

      return { isMatch: true, matchId: match.id };
    }

    // Premier like
    await prisma.match.create({
      data: {
        userAId: userId,
        userBId: targetUserId,
        status: "pending",
      },
    });

    return { isMatch: false };
  }
}

export const matchingService = new MatchingService();
