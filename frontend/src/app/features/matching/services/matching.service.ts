import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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

  swipe(targetUserId: string, direction: 'like' | 'pass') {
    // Optimistic removal from suggestions
    const currentSuggestions = this.suggestionsSig();
    this.suggestionsSig.set(currentSuggestions.filter(u => u.id !== targetUserId));

    return this.http.post<any>(`${this.apiUrl}/swipe`, { targetUserId, direction }).pipe(
      tap(res => {
        if (res.isMatch) {
          this.toastService.success("C'est un match ! Vous pouvez maintenant discuter.");
        }
      }),
      catchError(err => {
        // Rollback on error if necessary, or just show toast
        this.toastService.error(err.error?.message || 'Erreur lors du swipe.');
        return of(null);
      })
    );
  }
}
