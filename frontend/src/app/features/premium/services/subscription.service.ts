import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/subscription`;

  subscribe(plan: 'GOLD' | 'PLATINUM') {
    return this.http.post<any>(`${this.apiUrl}/subscribe`, { plan }).pipe(
      tap(res => {
        // Update local user state if needed
        if (res.user) {
          this.authService.updateCurrentUser(res.user);
        }
      })
    );
  }

  getStatus() {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }
}
