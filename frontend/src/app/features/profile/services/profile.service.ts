import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private authService = inject(AuthService);

  // Sync with AuthService currentUser
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    return user || {
      id: '',
      username: 'Invité',
      isPremium: false
    } as User;
  });

  updateProfile(updates: Partial<User>) {
    // TODO: Implement PUT /api/profile
    this.authService.currentUser.update(user => user ? { ...user, ...updates } : null);
  }

  // Mock Settings
  settings = signal({
    notifications: true,
    language: 'fr',
    privacy: 'public', // public, friends, private
    theme: 'light'
  });

  constructor() {
    // Load settings from storage/defaults
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.updateSettings({ ...this.settings(), theme: savedTheme });
    this.applyTheme(savedTheme);
  }

  updateSettings(updates: any) {
    this.settings.update(s => ({ ...s, ...updates }));
    if (updates.theme) {
      this.applyTheme(updates.theme);
      localStorage.setItem('theme', updates.theme);
    }
  }

  private applyTheme(theme: string) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
