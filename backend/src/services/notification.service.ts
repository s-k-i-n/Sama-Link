import webpush from 'web-push';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BBrSZ_yKgvVuI4BgIMzl7QUAnkKQFzud7nANU3DLry1hc1Hfmt5dpMF-PEpd30j50aQcjHqRJU8O9Fr5xdaMnlI';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'wo7VyJxKF4RrGzhprajH8h1CYPIknmjQEmy0I-Ga6XU';

webpush.setVapidDetails(
  'mailto:mouhamadousarr@gmail.com', // Change this in production
  vapidPublicKey,
  vapidPrivateKey
);

export class NotificationService {
  /**
   * Envoie une notification à un utilisateur spécifique
   */
  async sendToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
    try {
      const subscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        return;
      }

      const tasks = subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            JSON.stringify(payload)
          );
        } catch (error: any) {
          // Si l'abonnement est expiré ou invalide (410 Gone ou 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
            logger.info(`Subscription removed for user ${userId} (Status: ${error.statusCode})`);
          } else {
            logger.error('Error sending push notification:', error);
          }
        }
      });

      await Promise.all(tasks);

    } catch (error) {
      logger.error('Error in sendToUser:', error);
    }
  }

  /**
   * Enregistre un nouvel abonnement
   */
  async subscribe(userId: string, subscription: any) {
    const { endpoint, keys } = subscription;
    
    // On utilise upsert ou simple create with unique constraint bypass
    return (prisma as any).pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    });
  }

  /**
   * Désinscrit un utilisateur
   */
  async unsubscribe(endpoint: string) {
    return (prisma as any).pushSubscription.deleteMany({
      where: { endpoint }
    });
  }
}

export const notificationService = new NotificationService();
