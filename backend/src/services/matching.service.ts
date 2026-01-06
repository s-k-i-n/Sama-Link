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
      where: { userId },
      include: { user: { include: { interests: { include: { interest: true } } } } } // Get user interests for scoring
    }) as any;

    const defaultPrefs = { minAge: 18, maxAge: 99, genderPreference: null, maxDistance: 50 };
    const prefs = userPrefs || defaultPrefs;
    const myInterests = userPrefs?.user?.interests?.map((ui: any) => ui.interest.name) || [];

    // 2. Calculer les dates de naissance min/max pour le filtre d'âge
    const today = new Date();
    const maxBirthDate = new Date(today.getFullYear() - prefs.minAge, today.getMonth(), today.getDate());
    const minBirthDate = new Date(today.getFullYear() - prefs.maxAge - 1, today.getMonth(), today.getDate());

    // 3. Récupérer les IDs des utilisateurs déjà swipés (sauf si rewindés récemment?)
    const swipedUserIds = await prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { not: 'rewinded' } // Exclude rewinded matches so they can appear again if we delete them? 
        // Logic: if rewinded, we usually delete the match record. So this check is fine.
      },
      select: { userAId: true, userBId: true },
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

    if (prefs.genderPreference && prefs.genderPreference !== 'all') {
      whereClause.gender = prefs.genderPreference;
    }

    // Récupérer les candidats
    const candidates = await prisma.user.findMany({
      where: whereClause,
      take: limit * 2, // Fetch more to filter/sort
      include: { interests: { include: { interest: true } } }, // Include interests for scoring
    });

    // 5. Filtrage et Scoring
    const scoredCandidates = candidates.map(candidate => {
       // Filter Age
       if (candidate.birthDate) {
           const age = this.calculateAge(candidate.birthDate);
           if (age < prefs.minAge || age > prefs.maxAge) return null;
       }

       // Score Calculation
       let score = 0;
       
       // Interest Overlap
       const candidateInterests = candidate.interests.map(ui => ui.interest.name);
       const commonInterests = candidateInterests.filter(i => myInterests.includes(i)).length;
       score += commonInterests * 5; // 5 points per common interest

       // Distance (Mocked for now as we don't have Geo queries yet)
       // if (distance < prefs.maxDistance) score += (prefs.maxDistance - distance);

       // Recency Bonus
       const daysSinceLogin = (new Date().getTime() - candidate.updatedAt.getTime()) / (1000 * 3600 * 24);
       if (daysSinceLogin < 2) score += 10;
       if (daysSinceLogin < 7) score += 5;

       return { ...candidate, score, commonInterestsCount: commonInterests };
    }).filter(c => c !== null);

    // Sort by score desc
    scoredCandidates.sort((a: any, b: any) => b.score - a.score);

    return scoredCandidates.slice(0, limit);
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
   * Gère le swipe (Like/Pass/SuperLike)
   */
  async handleSwipe(userId: string, targetUserId: string, direction: "like" | "pass" | "superlike") {
    if (userId === targetUserId) throw new Error("Vous ne pouvez pas vous swiper vous-même.");

    // Check Super Like Limits
    if (direction === 'superlike') {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const canSuperLike = await this.checkSuperLikeLimit(user);
        if (!canSuperLike) {
            throw new Error("Limite de Super Likes atteinte pour aujourd'hui.");
        }
        // Deduct/Track use
        await prisma.user.update({
            where: { id: userId },
            data: { lastSuperLikeAt: new Date() }
        });
    }

    const isSuperLike = direction === 'superlike';
    const status = direction === 'pass' ? 'passed' : 'pending';

    if (direction === "pass") {
      return prisma.match.create({
        data: { userAId: userId, userBId: targetUserId, status: "passed" },
      });
    }

    // Check Reciprocity
    const existingInterest = await prisma.match.findFirst({
      where: {
        userAId: targetUserId,
        userBId: userId,
        status: { in: ['pending', 'matched'] } // Check if they liked us
      },
    });

    if (existingInterest) {
      // MATCH !
      const match = await prisma.match.update({
        where: { id: existingInterest.id },
        data: { 
            status: "matched",
            isSuperLike: existingInterest.isSuperLike || isSuperLike 
        },
      });
      return { isMatch: true, matchId: match.id, superLike: match.isSuperLike };
    }

    // Create Match Request
    await prisma.match.create({
      data: {
        userAId: userId,
        userBId: targetUserId,
        status: "pending",
        isSuperLike
      },
    });

    return { isMatch: false };
  }

  private async checkSuperLikeLimit(user: any): Promise<boolean> {
      if (user.isPremium) return true; // Unlimited or higher limit for premium
      
      if (!user.lastSuperLikeAt) return true;

      const today = new Date();
      const last = new Date(user.lastSuperLikeAt);
      
      // Reset at midnight or 24h rolling? Let's do same day check
      return last.getDate() !== today.getDate() || last.getMonth() !== today.getMonth() || last.getFullYear() !== today.getFullYear();
  }

  /**
   * Rewind last action (Premium feature usually)
   */
  async rewindLastSwipe(userId: string) {
      // Find last action where user was initiator (A)
      const lastMatch = await prisma.match.findFirst({
          where: { userAId: userId },
          orderBy: { createdAt: 'desc' }
      });

      if (!lastMatch) throw new Error("Aucune action à annuler.");
      
      // Allow rewind only if not matched yet? Or undo match too?
      // Usually we only undo the swipe action. If it caused a match, we dissolve it.
      
      await prisma.match.delete({
          where: { id: lastMatch.id }
      });

      return { success: true, undoUserId: lastMatch.userBId };
  }

  async updatePreferences(userId: string, preferences: any) {
    return prisma.userPreferences.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences }
    });
  }

  async getPreferences(userId: string) {
    return prisma.userPreferences.findUnique({ where: { userId } });
  }

  /**
   * Récupère la liste des utilisateurs qui ont liké le profil courant
   */
  async getWhoLikedMe(userId: string) {
      // Check if user is Premium to decide if we blur/hide data
      // For now, service returns raw data, Controller handles gating modification?
      // Better to handle it here or in controller. 
      // Let's return the list, and let controller or service modify based on premium status.
      
      const likes = await prisma.match.findMany({
          where: {
              userBId: userId,
              status: 'pending' // pending means they liked us, but we haven't responded yet
          },
          include: {
              userA: {
                  select: {
                      id: true,
                      username: true,
                      avatarUrl: true, // We might need to blur this on frontend or return placeholder
                      birthDate: true,
                      isPremium: true
                  }
              }
          },
          orderBy: { createdAt: 'desc' }
      });

      return likes.map(match => match.userA);
  }

  /**
   * Génère des brise-glace (Icebreakers) pour une conversation
   */
  async getIcebreakers(currentUserId: string, otherUserId: string) {
      const [currentUser, otherUser] = await Promise.all([
          prisma.user.findUnique({ where: { id: currentUserId }, include: { interests: { include: { interest: true } } } }),
          prisma.user.findUnique({ where: { id: otherUserId }, include: { interests: { include: { interest: true } } } })
      ]);

      if (!currentUser || !otherUser) return [];

      const icebreakers = [
          "Salut ! Comment se passe ta journée ?",
          "J'aime beaucoup ta photo de profil !"
      ];

      // 1. Common Interests
      const myInterests = (currentUser as any).interests.map((i: any) => i.interest.name);
      const theirInterests = (otherUser as any).interests.map((i: any) => i.interest.name);
      const common = myInterests.filter((i: any) => theirInterests.includes(i));

      if (common.length > 0) {
          icebreakers.push(`Je vois qu'on aime tous les deux ${common[0]} ! C'est ta passion ?`);
          if (common.length > 1) icebreakers.push(`On a ${common.length} points communs, y compris ${common[1]}.`);
      }

      // 2. Profile Details
      if (otherUser.jobTitle) {
          icebreakers.push(`Tu travailles comme ${otherUser.jobTitle} ? Ça doit être passionnant !`);
      }
      if (otherUser.school && currentUser.school === otherUser.school) {
          icebreakers.push(`Hey, on a fait la même école (${otherUser.school}) !`);
      }

      // Random fun
      const funQuestions = [
          "Si tu pouvais voyager n'importe où, tu irais où ?",
          "Pizza ou Burger ?",
          "Quelle est ta série du moment ?"
      ];
      icebreakers.push(funQuestions[Math.floor(Math.random() * funQuestions.length)]);

      // Shuffle and pick 3
      return icebreakers.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}

export const matchingService = new MatchingService();
