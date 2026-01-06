import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../index';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { plan, durationVal, durationUnit } = req.body; // e.g. GOLD, 1, MONTH

    // Mock Payment Validation
    // In real world: verify payment intent from Stripe/Wave

    let endDate = new Date();
    if (durationUnit === 'MONTH') {
        endDate.setMonth(endDate.getMonth() + durationVal);
    } else if (durationUnit === 'YEAR') {
        endDate.setFullYear(endDate.getFullYear() + durationVal);
    } else {
        endDate.setDate(endDate.getDate() + 7); // Default week
    }

    // Create Subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        startDate: new Date(),
        endDate,
        status: 'ACTIVE',
        provider: 'MOCK'
      }
    });

    // Update User to Premium
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });

    res.json({ success: true, subscription });
  } catch (error: any) {
    logger.error('Subscribe Error:', error);
    res.status(500).json({ message: error.message || 'Erreur abonnement' });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sub = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
        orderBy: { endDate: 'desc' }
    });

    res.json({ isPremium: !!sub, subscription: sub });
  } catch (error) {
    logger.error('Get Status Error:', error);
    res.status(500).json({ message: 'Erreur statut' });
  }
};
