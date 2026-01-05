import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Confession } from '../../../core/models/confession.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/feed`;
  private interactionUrl = `${environment.apiUrl}/interactions`;

  // State
  private confessionsSig = signal<Confession[]>([]);
  filterSig = signal<'recent' | 'popular' | 'nearby' | 'mine'>('recent');
  isLoading = signal<boolean>(false);
  errorSig = signal<string | null>(null);

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
    this.isLoading.set(true);
    this.errorSig.set(null);
    const params: any = { filter: this.filterSig() };
    
    if (params.filter === 'mine') {
      const user = this.authService.currentUser();
      if (user) params.userId = user.id;
    }

    this.http.get<Confession[]>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.confessionsSig.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => { 
        const msg = err.error?.message || 'Erreur lors du chargement des confessions.';
        this.errorSig.set(msg);
        this.toastService.error(msg);
        this.isLoading.set(false);
      }
    });
  }

  addConfession(content: string, location: string = 'Inconnu', isAnonymous: boolean = true, image?: File) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('location', location);
    formData.append('isAnonymous', String(isAnonymous));
    if (image) {
      formData.append('image', image);
    }

    return this.http.post<any>(this.apiUrl, formData).pipe(
      tap(() => {
        this.toastService.success('Votre confession a été publiée !');
        this.loadConfessions();
      })
    );
  }

  deleteConfession(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadConfessions())
    );
  }

  updateConfession(id: string, content: string) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, { content }).pipe(
      tap(() => this.loadConfessions())
    );
  }

  deleteAllMyConfessions() {
    return this.http.delete<any>(`${this.apiUrl}/mine/all`).pipe(
      tap(() => this.loadConfessions())
    );
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
      },
      error: () => this.toastService.error('Impossible d\'interagir pour le moment.')
    });
  }

  addComment(id: string, content: string) {
    return this.http.post<any>(`${this.interactionUrl}/${id}/comment`, { content });
  }

  getComments(id: string) {
    return this.http.get<any[]>(`${this.interactionUrl}/${id}/comments`);
  }
}
