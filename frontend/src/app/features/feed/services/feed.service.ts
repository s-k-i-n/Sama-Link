import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Confession } from '../../../core/models/confession.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/feed`;
  private interactionUrl = `${environment.apiUrl}/interactions`;

  // State
  private confessionsSig = signal<Confession[]>([]);
  filterSig = signal<'recent' | 'popular' | 'nearby' | 'mine'>('recent');

  // Selectors
  confessions = computed(() => this.confessionsSig());

  constructor() {
    this.loadConfessions();
  }

  setFilter(filter: 'recent' | 'popular' | 'nearby' | 'mine') {
    this.filterSig.set(filter);
    this.loadConfessions();
  }

  loadConfessions() {
    const params: any = { filter: this.filterSig() };
    
    // Si c'est le filtre 'mine', on passe le userId
    if (params.filter === 'mine') {
      const user = this.authService.currentUser();
      if (user) params.userId = user.id;
    }

    this.http.get<Confession[]>(this.apiUrl, { params }).subscribe({
      next: (data) => this.confessionsSig.set(data),
      error: (err) => console.error('Erreur chargement confessions', err)
    });
  }

  addConfession(content: string, location: string = 'Inconnu', isAnonymous: boolean = true) {
    return this.http.post<any>(this.apiUrl, { content, location, isAnonymous }).subscribe({
      next: (res) => {
        // Ajout optimiste ou recharger
        this.loadConfessions();
      }
    });
  }

  toggleLike(id: string) {
    this.http.post<any>(`${this.interactionUrl}/${id}/like`, {}).subscribe({
      next: (res) => {
        this.confessionsSig.update(list => 
          list.map(c => c.id === id ? { 
            ...c, 
            isLiked: res.isLiked, 
            likes: res.isLiked ? c.likes + 1 : c.likes - 1 
          } : c)
        );
      }
    });
  }

  addComment(id: string, content: string) {
    return this.http.post<any>(`${this.interactionUrl}/${id}/comment`, { content });
  }

  getComments(id: string) {
    return this.http.get<any[]>(`${this.interactionUrl}/${id}/comments`);
  }
}
