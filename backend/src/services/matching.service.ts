import prisma from "../lib/prisma";

export class MatchingService {
  /**
   * Récupère des suggestions de profils
   */
  /**
   * Récupère des suggestions de profils avec filtres
   */
  async getSuggestions(userId: string, limit: number = 20) {
    // 1. Récupérer les préférences de l'utilisateur ou valeurs par défaut
    const userPrefs = await prisma.userPreferences.findUnique({ 
      where: { userId } 
    }) || { minAge: 18, maxAge: 99, genderPreference: null, maxDistance: 50 };

    // 2. Calculer les dates de naissance min/max pour le filtre d'âge
    const today = new Date();
    // Age min 18 => né avant aujourd'hui - 18 ans
    const maxBirthDate = new Date(today.getFullYear() - userPrefs.minAge, today.getMonth(), today.getDate());
    // Age max 99 => né après aujourd'hui - 99 ans - 1 an (pour inclure toute l'année)
    const minBirthDate = new Date(today.getFullYear() - userPrefs.maxAge - 1, today.getMonth(), today.getDate());

    // 3. Récupérer les IDs des utilisateurs déjà swipés
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
      excludedIds.add(m.userAId === userId ? m.userBId : m.userAId);
    });

    // 4. Construire la requête avec filtres
    const whereClause: any = {
      id: { notIn: Array.from(excludedIds) },
    };

    // Filtre Age et Genre
    if (userPrefs.genderPreference && userPrefs.genderPreference !== 'all') {
      whereClause.gender = userPrefs.genderPreference;
    }

    // Récupérer les candidats
    const suggestions = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      orderBy: { updatedAt: "desc" }, // Ou un algo de score plus tard
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        avatarUrl: true,
        birthDate: true,
        gender: true,
      },
    });

    // Filtrage post-query pour l'âge (plus sûr si birthDate est null)
    return suggestions.filter(user => {
      if (!user.birthDate) return true; // On garde ceux sans date pour l'instant
      const age = this.calculateAge(user.birthDate);
      return age >= userPrefs.minAge && age <= userPrefs.maxAge;
    });
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  /**
   * Met à jour les préférences de matching de l'utilisateur
   */
  async updatePreferences(userId: string, preferences: { 
    minAge?: number; 
    maxAge?: number; 
    genderPreference?: string;
    maxDistance?: number;
  }) {
    return prisma.userPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });
  }

  /**
   * Récupère les préférences de l'utilisateur
   */
  async getPreferences(userId: string) {
    return prisma.userPreferences.findUnique({
      where: { userId }
    });
  }
}

export const matchingService = new MatchingService();
