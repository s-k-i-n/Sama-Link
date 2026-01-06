import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

export interface AuthResponse {
  token: string;
  user: any; // On pourrait typer User plus précisément plus tard
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}`;
  
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

  /**
   * Connexion utilisateur (Email/Phone/Username + Password)
   */
  login(identifier: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { identifier, password }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Inscription utilisateur
   */
  register(username: string, password: string, email?: string, phone?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, password, email, phone }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  private handleAuthSuccess(authResult: AuthResponse) {
    this.setSession(authResult);
    this.toastService.success(`Heureux de vous revoir, ${authResult.user.username || authResult.user.email || 'utilisateur'} !`);
  }

  private setSession(authResult: AuthResponse) {
    this.storage.setItem('access_token', authResult.token);
    this.storage.setItem('user', JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(true);
    // On peut aussi gérer hasCompletedOnboarding ici selon la réponse du backend
  }

  completeOnboarding() {
      this.hasCompletedOnboarding.set(true);
  }

  updateCurrentUser(user: any) {
    const updatedUser = { ...this.currentUser(), ...user };
    this.storage.setItem('user', JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
  }

  logout() {
    this.storage.removeItem('access_token');
    this.storage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.hasCompletedOnboarding.set(false);
    this.toastService.info('Vous avez été déconnecté.');
    this.router.navigate(['/auth/login']);
  }
}
