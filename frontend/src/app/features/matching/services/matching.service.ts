import { Injectable, signal, computed } from '@angular/core';
import { User, Match } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  // Mock Data
  private suggestionsSig = signal<User[]>([]);
  private matchesSig = signal<Match[]>([]);
  
  suggestions = computed(() => this.suggestionsSig());
  matches = computed(() => this.matchesSig());

  constructor() {
    this.loadSuggestions();
  }

  loadSuggestions() {
    const MOCK_USERS: User[] = [
      {
        id: '1',
        username: 'Aissatou',
        age: 24,
        gender: 'female',
        location: 'Dakar, Plateau',
        bio: "Passionnée de photographie et de jazz. Je cherche des discussions profondes, pas de superficiel.",
        interests: ['Photo', 'Jazz', 'Voyage', 'Cuisine'],
        compatibilityScore: 92,
        distance: 3
      },
      {
        id: '2',
        username: 'Moussa',
        age: 28,
        gender: 'male',
        location: 'Mermoz',
        bio: "Entrepreneur dans la tech. J'aime le sport et les bons tiéboudienne.",
        interests: ['Tech', 'Football', 'Business'],
        compatibilityScore: 85,
        distance: 5
      },
      {
        id: '3',
        username: 'Fatou',
        age: 23,
        gender: 'female',
        location: 'Yoff',
        bio: "Étudiante en médecine. Toujours souriante :)",
        interests: ['Cinéma', 'Lecture', 'Plage'],
        compatibilityScore: 78,
        distance: 8
      }
    ];
    this.suggestionsSig.set(MOCK_USERS);
  }

  like(userId: string): boolean {
    // Determine result (Mocking 30% chance of match)
    const isMatch = Math.random() > 0.7;
    
    // Remove from suggestions
    const likedUser = this.suggestionsSig().find(u => u.id === userId);
    this.suggestionsSig.update(list => list.filter(u => u.id !== userId));

    if (isMatch && likedUser) {
      // Create new match
      const newMatch: Match = {
        id: Math.random().toString(36).substr(2, 9),
        users: [likedUser, { id: 'me', username: 'Moi', age: 25, gender: 'male', location: 'Dakar', bio: '', interests: [] }], // Mock 'me'
        createdAt: new Date(),
        unreadCount: 0
      };
      this.matchesSig.update(list => [newMatch, ...list]);
    }

    return isMatch;
  }

  pass(userId: string) {
    this.suggestionsSig.update(list => list.filter(u => u.id !== userId));
  }
}
