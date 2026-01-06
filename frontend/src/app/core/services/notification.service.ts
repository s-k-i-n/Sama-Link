import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  private readonly VAPID_PUBLIC_KEY = 'BBrSZ_yKgvVuI4BgIMzl7QUAnkKQFzud7nANU3DLry1hc1Hfmt5dpMF-PEpd30j50aQcjHqRJU8O9Fr5xdaMnlI';
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  /**
   * Demande l'autorisation et s'abonne aux notifications push
   */
  async requestPermissionAndSubscribe() {
    if (!this.swPush.isEnabled) {
      console.warn('Notifications Push non supportées ou Service Worker désactivé.');
      return;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      // Envoyer l'abonnement au serveur
      this.http.post(`${this.API_URL}/subscribe`, subscription).subscribe({
        next: () => {
          this.toast.show('Notifications activées ! 🔔', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de l\'envoi de la subscription:', err);
          this.toast.show('Erreur lors de l\'activation des notifications.', 'error');
        }
      });

    } catch (err) {
      console.error('Erreur de permission push:', err);
    }
  }

  /**
   * Se désabonner
   */
  async unsubscribe() {
    try {
      const subscription = await this.swPush.subscription.toPromise();
      if (subscription) {
        this.http.post(`${this.API_URL}/unsubscribe`, { endpoint: subscription.endpoint }).subscribe();
        await this.swPush.unsubscribe();
        this.toast.show('Notifications désactivées.', 'info');
      }
    } catch (err) {
      console.error('Erreur désabonnement:', err);
    }
  }

  /**
   * Écoute les notifications entrantes (optionnel si géré par SW)
   */
  listenToNotifications() {
    this.swPush.messages.subscribe(message => {
      console.log('Notification reçue en premier plan:', message);
    });

    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      console.log('Notification cliquée:', notification);
      // Rediriger vers la conversation par exemple
      if (notification.data && notification.data.url) {
        window.open(notification.data.url, '_blank');
      }
    });
  }
}
