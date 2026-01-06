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
      include: { user: { include: { interests: { include: { interest: true } } } } } // Get user for premium status AND interests
    }) as any;

    const defaultPrefs = { minAge: 18, maxAge: 99, genderPreference: null, maxDistance: 50, passportLatitude: null, passportLongitude: null };
    const prefs = userPrefs || defaultPrefs;
    const user = userPrefs?.user;
    const myInterests = user?.interests?.map((ui: any) => (ui as any).interest.name) || [];

    // Base coordinates for distance (use Passport if available)
    const baseLat = prefs.passportLatitude ? prefs.passportLatitude : user?.latitude;
    const baseLng = prefs.passportLongitude ? prefs.passportLongitude : user?.longitude;

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
       let score = 100; // Base Score
       
       // Interest Overlap
       const candidateInterests = candidate.interests.map(ui => ui.interest.name);
       const commonInterests = candidateInterests.filter(i => myInterests.includes(i)).length;
       score += commonInterests * 20; // 20 points per common interest

       // Distance Logic
       let distance = 0;
       if (baseLat && baseLng && candidate.latitude && candidate.longitude) {
           distance = this.calculateDistance(baseLat, baseLng, candidate.latitude, candidate.longitude);
           if (distance > prefs.maxDistance) return null; // Hard filter
       }
       score -= Math.min(distance, 50); // Deduct up to 50 points based on distance

       // Recency Bonus (Activity Bonus)
       const lastActive = candidate.lastSeen || candidate.updatedAt;
       const hoursSinceActive = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600);
       
       if (hoursSinceActive < 24) score += 10;
       if (hoursSinceActive < 2) score += 10; // Extra bonus for very recent activity

       return { 
         ...candidate, 
         interests: candidateInterests,
         score, 
         commonInterestsCount: commonInterests 
       };
    }).filter((c: any) => c !== null);

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

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Gère le swipe (Like/Pass/SuperLike)
   */
  async handleSwipe(userId: string, targetUserId: string, direction: "like" | "pass" | "superlike") {
    if (userId === targetUserId) throw new Error("Vous ne pouvez pas vous swiper vous-même.");

    // Check Super Like Limits
    if (direction === 'superlike') {
        const user = await prisma.user.findUnique({ where: { id: userId } }) as any;
        const canSuperLike = await this.checkSuperLikeLimit(user);
        if (!canSuperLike) {
            throw new Error("Limite de Super Likes atteinte pour aujourd'hui.");
        }
        // Deduct/Track use
        await prisma.user.update({
            where: { id: userId },
            data: { 
                lastSuperLikeAt: new Date(),
                dailySuperLikeCount: { increment: 1 }
            }
        });
    }

    // Check Regular Like Limits for FREE users
    if (direction === 'like') {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (false) { // Limits DISABLED for all users
            const canLike = await this.checkLikeLimit(user);
            if (!canLike) {
               throw new Error("Limite de Likes atteinte pour aujourd'hui. Passez Premium pour des likes illimités ! 🚀");
            }
            // Update counts
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    lastLikeAt: new Date(),
                    dailyLikeCount: { increment: 1 }
                }
            });
        }
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

      // Notify both users
      try {
        const { notificationService } = await import('./notification.service');
        // Notify the current user (the one who just swiped)
        await notificationService.sendToUser(userId, {
            title: "C'est un match ! ❤️",
            body: "Vous avez une nouvelle connexion sur Sama Link.",
            url: `/messages/${match.id}`
        });
        // Notify the target user
        await notificationService.sendToUser(targetUserId, {
            title: "Nouveau match ! 🔥",
            body: "Quelqu'un de spécial vient de vous liker en retour.",
            url: `/messages/${match.id}`
        });
      } catch (err) {
        console.error('Match notification failed:', err);
      }

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
      const today = new Date();
      const last = user.lastSuperLikeAt ? new Date(user.lastSuperLikeAt) : null;
      
      const isSameDay = last && (
          last.getDate() === today.getDate() && 
          last.getMonth() === today.getMonth() && 
          last.getFullYear() === today.getFullYear()
      );

      const count = isSameDay ? user.dailySuperLikeCount : 0;
      
      // If it's a new day, we effectively reset the count in logic 
      // (The db will be updated on the next use)
      const limit = 5; // Unlocked for all

      return true; // Always allow
  }

  /**
   * Rewind last action (Premium feature usually)
   */
  async rewindLastSwipe(userId: string) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      // Premium check REMOVED for universal access

      // Find last action where user was initiator (A)
      const lastMatch = await prisma.match.findFirst({
          where: { userAId: userId },
          orderBy: { createdAt: 'desc' }
      });

      if (!lastMatch) throw new Error("Aucune action à annuler.");
      
      await prisma.match.delete({
          where: { id: lastMatch.id }
      });

      return { success: true, undoUserId: lastMatch.userBId };
  }

  private async checkLikeLimit(user: any): Promise<boolean> {
      const today = new Date();
      const last = user.lastLikeAt ? new Date(user.lastLikeAt) : null;
      
      const isSameDay = last && (
          last.getDate() === today.getDate() && 
          last.getMonth() === today.getMonth() && 
          last.getFullYear() === today.getFullYear()
      );

      const count = isSameDay ? user.dailyLikeCount : 0;
      return count < 10; // FREE Limit
  }

  async updatePreferences(userId: string, preferences: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Passport Protection
    // Passport Protection REMOVED for universal access

    return prisma.userPreferences.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences }
    });
  }

  async getPreferences(userId: string) {
    return prisma.userPreferences.findUnique({ where: { userId } });
  }

  // Récupère la liste des utilisateurs qui ont liké le profil courant
  async getWhoLikedMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isPremium = true; // Forced for universal access

    const likes = await prisma.match.findMany({
      where: {
        userBId: userId,
        status: "pending",
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            birthDate: true,
            bio: true,
            location: true,
            gender: true,
            interests: { include: { interest: true } }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // MASK DATA if not Premium
    return likes.map((l: any) => {
       const u = l.userA;
       if (!isPremium) {
           return {
               id: u.id,
               username: "Quelqu'un", // Mask username
               avatarUrl: u.avatarUrl, // We will blur this in Frontend
               age: null,
               bio: "Passez Premium pour voir ce profil !",
               isBlurred: true
           };
       }
       // Calculate age if not masked
       const age = u.birthDate ? this.calculateAge(new Date(u.birthDate)) : null;
       const interestList = u.interests.map((ui: any) => ui.interest.name);
       return { ...u, age, interests: interestList, isBlurred: false };
    });
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

  /**
   * Demande de connexion via une confession
   */
  async requestConfessionMatch(userId: string, confessionId: string) {
    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      select: { authorId: true }
    });

    if (!confession) throw new Error("Confession introuvable.");
    if (confession.authorId === userId) throw new Error("Vous ne pouvez pas vous connecter à votre propre confession.");

    // Check if a match or request already exists
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: confession.authorId },
          { userAId: confession.authorId, userBId: userId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'matched') throw new Error("Vous êtes déjà connectés !");
      throw new Error("Une demande est déjà en cours.");
    }

    return prisma.match.create({
      data: {
        userAId: userId,
        userBId: confession.authorId,
        confessionId: confessionId,
        status: "pending_confession"
      }
    });
  }

  /**
   * Répondre à une demande de connexion
   */
  async respondToMatchRequest(userId: string, matchId: string, action: 'accept' | 'decline') {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { userA: true, userB: true }
    });

    if (!match || match.userBId !== userId) {
      throw new Error("Demande introuvable ou non autorisée.");
    }

    if (action === 'decline') {
      return prisma.match.delete({ where: { id: matchId } });
    }

    // ACCEPT
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'matched' }
    });

    // Notify requester
    try {
      const { notificationService } = await import('./notification.service');
      await notificationService.sendToUser(match.userAId, {
        title: "Demande acceptée ! 🎉",
        body: `${match.userB.username} a accepté votre demande de connexion.`,
        url: `/messages/${match.id}`
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return updatedMatch;
  }

  /**
   * Liste des demandes en attente pour l'utilisateur
   */
  async getPendingRequests(userId: string) {
    return prisma.match.findMany({
      where: {
        userBId: userId,
        status: "pending_confession"
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true, // Only if accepted? User says "if accepted they see name/photo". So here we might mask.
            avatarUrl: true
          }
        },
        confession: {
          select: {
            content: true,
            imageUrl: true
          }
        }
      }
    });
  }
}

export const matchingService = new MatchingService();
