import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // Mock Current User State
  private currentUserSig = signal<User>({
    id: 'me',
    username: 'Mouhamadou',
    age: 25,
    gender: 'male',
    location: 'Dakar, Sénégal',
    bio: "Développeur passionné par l'IA et les applications Web. J'adore le café et le surf 🏄‍♂️.",
    interests: ['Coding', 'Surf', 'Café', 'Tech'],
    isPremium: false,
    occupation: 'Lead Dev',
    education: 'ESP Dakar',
    profilePhotoUrl: '' 
  });

  currentUser = computed(() => this.currentUserSig());

  updateProfile(updates: Partial<User>) {
    this.currentUserSig.update(user => ({ ...user, ...updates }));
  }

  updatePhoto(url: string) {
    this.currentUserSig.update(user => ({ ...user, profilePhotoUrl: url }));
  }

  // Mock Settings
  settings = signal({
    notifications: true,
    language: 'fr',
    privacy: 'public' // public, friends, private
  });

  updateSettings(updates: any) {
    this.settings.update(s => ({ ...s, ...updates }));
  }
}
