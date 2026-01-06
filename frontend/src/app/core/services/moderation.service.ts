import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/moderation`;

  // Keep mock signal for local check until we sync full blocked list
  private blockedUsersSig = signal<string[]>([]);

  blockUser(userId: string) {
    // Optimistic update
    this.blockedUsersSig.update(list => [...list, userId]);
    
    return this.http.post(`${this.apiUrl}/block`, { blockedId: userId });
  }

  isBlocked(userId: string): boolean {
    return this.blockedUsersSig().includes(userId);
  }

  reportUser(reportedId: string, reason: string) {
    return this.http.post(`${this.apiUrl}/report`, { reportedId, reason });
  }
}
