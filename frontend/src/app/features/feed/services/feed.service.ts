import { Injectable, signal, computed } from '@angular/core';
import { Confession } from '../../../core/models/confession.model';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  // State
  private confessionsSig = signal<Confession[]>([]);
  filterSig = signal<'recent' | 'popular' | 'nearby' | 'mine'>('recent');

  // Selectors
  confessions = computed(() => {
    const all = this.confessionsSig();
    const filter = this.filterSig();

    switch (filter) {
      case 'popular':
        return [...all].sort((a, b) => b.likes - a.likes);
      case 'nearby':
        return all.filter((c) => c.location === 'Dakar'); // Mock proximity
      case 'mine':
        return all.filter((c) => c.authorAlias === 'Moi (Pseudo)'); // Mock "My confessions"
      case 'recent':
      default:
        return [...all].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  setFilter(filter: 'recent' | 'popular' | 'nearby' | 'mine') {
    this.filterSig.set(filter);
  }

  constructor() {
    // Initial mock data
    this.loadConfessions();
  }

  loadConfessions() {
    // TODO: Connect to Real Backend
    // this.http.get<Confession[]>(`${environment.apiUrl}/feed`).subscribe(...)
    this.confessionsSig.set([]); 
  }

  addConfession(content: string, location: string = 'Inconnu', isAnonymous: boolean = true) {
    // Determine alias based on anonymity (in real app, backend handles this based on user session)
    // Here we simulate passing the alias if not anonymous
    const authorAlias = isAnonymous ? 'Anonyme' : 'Moi (Pseudo)';

    const newConfession: Confession = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      createdAt: new Date(),
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      location,
      authorAlias,
    };

    this.confessionsSig.update((list) => [newConfession, ...list]);
  }

  toggleLike(id: string) {
    this.confessionsSig.update((list) =>
      list.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          };
        }
        return c;
      })
    );
  }
}
