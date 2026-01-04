import { Injectable, signal } from '@angular/core';
import { SlToastComponent } from '../../../shared/ui/sl-toast/sl-toast';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {
  // Mock Block list
  private blockedUsersSig = signal<string[]>([]);

  blockUser(userId: string) {
    this.blockedUsersSig.update(list => [...list, userId]);
    console.log(`[Moderation] User ${userId} blocked.`);
  }

  unblockUser(userId: string) {
    this.blockedUsersSig.update(list => list.filter(id => id !== userId));
    console.log(`[Moderation] User ${userId} unblocked.`);
  }

  isBlocked(userId: string): boolean {
    return this.blockedUsersSig().includes(userId);
  }

  reportContent(contentId: string, contentType: 'confession' | 'message', reason: string) {
    console.log(`[Moderation] Reported ${contentType} ${contentId}: ${reason}`);
    // roughly simulate API call
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
