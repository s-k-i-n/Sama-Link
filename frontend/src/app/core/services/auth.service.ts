import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storage = inject(StorageService);
  private router = inject(Router);
  
  // Use Signals for state management as requested
  currentUser = signal<any | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuth();
  }

  private checkAuth() {
    const token = this.storage.getItem('access_token');
    if (token) {
      // TODO: Validate token expiry or fetch profile
      this.isAuthenticated.set(true);
    }
  }

  // Mock state for onboarding
  hasCompletedOnboarding = signal<boolean>(false);

  login(token: string, user: any) {
    this.storage.setItem('access_token', token);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    // For demo, assume fresh login means onboarding needed unless specified
    this.hasCompletedOnboarding.set(false);
  }

  completeOnboarding() {
      this.hasCompletedOnboarding.set(true);
  }

  logout() {
    this.storage.removeItem('access_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.hasCompletedOnboarding.set(false);
    this.router.navigate(['/auth/login']);
  }
}
