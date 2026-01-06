import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import logger from '../utils/logger';

export const requestVerification = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const file = req.file;
        
        if (!file) {
             return res.status(400).json({ message: "Selfie requis." });
        }
        
        // Use existing upload logic or assume URL is present if we use S3/Cloudinary 
        // For local upload, we construct the URL
        const verificationImage = `/uploads/${file.filename}`;

        await prisma.user.update({
            where: { id: userId },
            data: {
                verificationStatus: 'PENDING',
                verificationImage
            }
        });

        res.json({ message: "Demande de vérification envoyée.", status: 'PENDING' });

    } catch (error) {
        logger.error('Erreur requestVerification:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const approveVerification = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // VERIFIED or REJECTED
        
        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: "Status invalide." });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                verificationStatus: status,
                isVerified: status === 'VERIFIED'
            }
        });

        res.json({ message: `Utilisateur ${status}`, user });
    } catch(error) {
        logger.error('Erreur approveVerification:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getPendingVerifications = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { verificationStatus: 'PENDING' },
            select: { id: true, username: true, verificationImage: true, photos: true }
        });
        res.json(users);
    } catch(error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
