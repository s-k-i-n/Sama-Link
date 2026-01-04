import { Injectable, signal, computed } from '@angular/core';
import { Confession } from '../../../core/models/confession.model';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  // State
  private confessionsSig = signal<Confession[]>([]);
  
  // Selectors
  confessions = computed(() => this.confessionsSig());

  constructor() {
    // Initial mock data
    this.loadConfessions();
  }

  loadConfessions() {
    // Mock API call
    const MOCK_DATA: Confession[] = [
      {
        id: '1',
        content: "Je n'ai jamais avoué à mes parents que j'ai changé de filière à l'université il y a 2 ans. Ils pensent que je fais Droit alors que je suis en Arts.",
        createdAt: new Date(),
        likes: 124,
        commentsCount: 12,
        isLiked: false,
        location: 'Dakar'
      },
      {
        id: '2',
        content: "Parfois je vais manger seul au restaurant juste pour observer les gens et imaginer leurs vies.",
        createdAt: new Date(Date.now() - 3600000),
        likes: 45,
        commentsCount: 3,
        isLiked: true,
        location: 'Saint-Louis'
      }
    ];
    this.confessionsSig.set(MOCK_DATA);
  }

  addConfession(content: string, location: string = 'Inconnu') {
    const newConfession: Confession = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      createdAt: new Date(),
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      location
    };
    
    this.confessionsSig.update(list => [newConfession, ...list]);
  }

  toggleLike(id: string) {
    this.confessionsSig.update(list => 
      list.map(c => {
        if (c.id === id) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1
          };
        }
        return c;
      })
    );
  }
}
