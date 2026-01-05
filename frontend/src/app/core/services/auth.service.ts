import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Use Signals for state management as requested
  currentUser = signal<any | null>(null);
  isAuthenticated = signal<boolean>(false);
  hasCompletedOnboarding = signal<boolean>(false);

  constructor() {
    this.checkAuth();
  }

  private checkAuth() {
    const token = this.storage.getItem('access_token');
    if (token) {
      // Pour l'instant on considère que s'il y a un token, on est authentifié
      // Récupérer le user depuis le storage s'il y est
      const user = this.storage.getItem('user');
      if (user) {
        this.currentUser.set(JSON.parse(user));
      }
      this.isAuthenticated.set(true);
    }
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  private setSession(authResult: any) {
    this.storage.setItem('access_token', authResult.token);
    this.storage.setItem('user', JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(true);
    // On peut aussi gérer hasCompletedOnboarding ici selon la réponse du backend
  }

  completeOnboarding() {
      this.hasCompletedOnboarding.set(true);
  }

  logout() {
    this.storage.removeItem('access_token');
    this.storage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.hasCompletedOnboarding.set(false);
    this.router.navigate(['/auth/login']);
  }
}
