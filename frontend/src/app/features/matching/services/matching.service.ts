import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserPreferences {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  genderPreference: 'male' | 'female' | 'all' | null;
  passportLatitude?: number | null;
  passportLongitude?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/matching`;

  private suggestionsSig = signal<User[]>([]);
  private isLoadingSig = signal(false);
  
  suggestions = computed(() => this.suggestionsSig());
  isLoading = computed(() => this.isLoadingSig());

  constructor() {
    this.loadSuggestions();
  }

  loadSuggestions() {
    this.isLoadingSig.set(true);
    this.http.get<User[]>(`${this.apiUrl}/suggestions`).subscribe({
      next: (data) => {
        this.suggestionsSig.set(data);
        this.isLoadingSig.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des suggestions.');
        this.isLoadingSig.set(false);
      }
    });
  }

  getPreferences() {
    return this.http.get<UserPreferences>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(prefs: Partial<UserPreferences>) {
    return this.http.put<UserPreferences>(`${this.apiUrl}/preferences`, prefs).pipe(
      tap(() => {
        this.toastService.success('Préférences mises à jour');
        this.loadSuggestions(); // Reload suggestions with new filters
      })
    );
  }

  swipe(targetUserId: string, direction: 'like' | 'pass' | 'superlike') {
    // Optimistic removal from suggestions
    const currentSuggestions = this.suggestionsSig();
    this.suggestionsSig.set(currentSuggestions.filter(u => u.id !== targetUserId));

    return this.http.post<any>(`${this.apiUrl}/swipe`, { targetUserId, direction }).pipe(
      tap(res => {
        if (res.isMatch) {
          this.toastService.success("C'est un match ! Vous pouvez maintenant discuter.");
        }
      }),
      // Don't catch error here fully, let component handle strict limits (400)
      catchError(err => {
         // Revert optimistic update if error?
         // For now, simple logging
        console.error('Swipe error', err);
        throw err;
      })
    );
  }

  rewind() {
      return this.http.post<any>(`${this.apiUrl}/rewind`, {});
  }

  getWhoLikedMe() {
    return this.http.get<any[]>(`${this.apiUrl}/who-liked-me`).pipe(
      catchError(err => {
        console.error('Error fetching likes', err);
        throw err;
      })
    );
  }
}
