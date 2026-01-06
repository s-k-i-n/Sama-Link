import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs/operators';

export interface Interest {
    id: string;
    name: string;
    icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  // Sync with AuthService currentUser
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return {
        id: '',
        username: 'Invité',
        isPremium: false,
        interests: [],
        gender: 'other',
        location: '',
        bio: '',
        photos: []
      } as User;
    }
    // Deep fallback for all critical fields to prevent runtime errors
    return {
      ...user,
      interests: user.interests || [],
      photos: user.photos || [],
      bio: user.bio || '',
      location: user.location || '',
      jobTitle: user.jobTitle || ''
    } as User;
  });

  loadProfile() {
    this.http.get<User>(`${environment.apiUrl}/profile`).subscribe({
      next: (user) => {
        // Update AuthService state which drives the computed currentUser
        this.authService.currentUser.set(user);
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  updateProfile(updates: Partial<User>) {
    return this.http.put<User>(`${environment.apiUrl}/profile`, updates).pipe(
        tap(updatedUser => {
             this.authService.currentUser.set(updatedUser);
        })
    ).subscribe();
  }

  checkSubscription() {
    this.http.get<{ isPremium: boolean, subscription: any }>(`${environment.apiUrl}/subscription/status`).subscribe({
      next: (res) => {
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.isPremium !== res.isPremium) {
           this.authService.currentUser.set({ ...currentUser, isPremium: res.isPremium });
        }
      }
    });
  }
  
  getInterests() {
    return this.http.get<Record<string, Interest[]>>(`${environment.apiUrl}/profile/interests`);
  }

  requestVerification(file: File) {
      const formData = new FormData();
      formData.append('image', file);
      return this.http.post<{ message: string, status: string }>(`${environment.apiUrl}/admin/verification/request`, formData);
  }

  deleteAccount() {
    return this.http.delete(`${environment.apiUrl}/profile`).pipe(
      tap(() => this.authService.logout())
    );
  }

  exportData() {
    return this.http.get(`${environment.apiUrl}/profile/export`).subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sama_link_data_${this.currentUser().username}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
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
    const savedTheme = this.storageService.getItem('theme') || 'light';
    this.updateSettings({ ...this.settings(), theme: savedTheme });
    this.applyTheme(savedTheme);
  }

  updateSettings(updates: any) {
    this.settings.update(s => ({ ...s, ...updates }));
    if (updates.theme) {
      this.applyTheme(updates.theme);
      this.storageService.setItem('theme', updates.theme);
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
