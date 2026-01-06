import prisma from "../lib/prisma";

export class SubscriptionService {
  async subscribe(userId: string, plan: 'GOLD' | 'PLATINUM') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Utilisateur non trouvé.");

    // Create Subscription record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month default

    await prisma.subscription.create({
      data: {
        userId,
        plan: plan as any,
        startDate,
        endDate,
        status: 'ACTIVE',
        provider: 'SIMULATED'
      }
    });

    // Update User fast lookup
    return (prisma.user as any).update({
      where: { id: userId },
      data: { 
        plan: plan as any,
        isPremium: true
      }
    });
  }

  async getStatus(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const subscriptionService = new SubscriptionService();
