import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { logger } from '../index';

// Validation schema for profile update
const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  occupation: z.string().optional(), // Maps to jobTitle
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  school: z.string().optional(),
  educationLevel: z.string().optional(),
  height: z.number().nullable().optional(),
  religion: z.string().optional(),
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  children: z.string().optional(),
  gender: z.string().optional(),
  interests: z.array(z.string()).optional(), // List of Interest IDs or Names
  photos: z.array(z.string()).optional(),
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: {
            include: { interest: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Transform user interests to flat array if needed
    const interests = user.interests.map(ui => ui.interest.name);

    res.json({ 
      ...user, 
      interests,
      isPremium: true, // Forced for universal access
      plan: 'PLATINUM' // Forced for universal access
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { interests, occupation, ...data } = validation.data;
    
    // Handle occupation mapping if provided
    const updateData: any = { ...data };
    if (occupation) updateData.jobTitle = occupation;

    // Handle Interests update if provided
    if (interests) {
        // 1. Delete existing connections
        await prisma.userInterest.deleteMany({
            where: { userId }
        });

        // 2. Find interest IDs by name (assuming frontend sends names, or we can handle IDs)
        // For simplicity let's assume we receive Interest Names based on our seed
        const interestRecords = await prisma.interest.findMany({
            where: { name: { in: interests } }
        });

        // 3. Create new connections
        if (interestRecords.length > 0) {
             await prisma.userInterest.createMany({
                data: interestRecords.map(i => ({
                    userId,
                    interestId: i.id
                }))
             });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
          interests: { include: { interest: true } }
      }
    });

    const flatInterests = updatedUser.interests.map(ui => ui.interest.name);

    res.json({ ...updatedUser, interests: flatInterests });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

export const getInterests = async (req: Request, res: Response) => {
    try {
        const interests = await prisma.interest.findMany({
            orderBy: { category: 'asc' }
        });
        
        // Group by category
        const grouped = interests.reduce((acc: any, curr) => {
            if (!acc[curr.category]) acc[curr.category] = [];
            acc[curr.category].push({
                id: curr.id,
                name: curr.name,
                icon: curr.icon
            });
            return acc;
        }, {});

        res.json(grouped);
    } catch (error) {
        logger.error('Error fetching interests:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

/**
 * Supprime le compte utilisateur et toutes les données associées (GDPR)
 */
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        
        // Prisma cascade delete will handle most if configured, 
        // otherwise we do it manually. In schema.prisma many are NOT cascade.
        // Let's perform cleanup.
        await prisma.match.deleteMany({ where: { OR: [{ userAId: userId }, { userBId: userId }] } });
        await prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });
        await prisma.subscription.deleteMany({ where: { userId } });
        await prisma.userInterest.deleteMany({ where: { userId } });
        await prisma.confession.deleteMany({ where: { authorId: userId } });
        
        await prisma.user.delete({ where: { id: userId } });
        
        res.json({ message: "Compte supprimé avec succès. Adieu ! 👋" });
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};

/**
 * Exporte les données utilisateur (GDPR)
 */
export const exportData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                interests: { include: { interest: true } },
                sentMessages: true,
                receivedMessages: true,
                subscriptions: true
            }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Sanitized export
        const exportObj = {
            profile: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                location: user.location,
                interests: user.interests.map(i => i.interest.name)
            },
            activity: {
                messagesSentCount: user.sentMessages.length,
                messagesReceivedCount: user.receivedMessages.length,
                subscriptionHistory: user.subscriptions
            },
            exportedAt: new Date()
        };

        res.json(exportObj);
    } catch (error) {
        logger.error('Error exporting data:', error);
        res.status(500).json({ message: "Erreur export." });
    }
};
