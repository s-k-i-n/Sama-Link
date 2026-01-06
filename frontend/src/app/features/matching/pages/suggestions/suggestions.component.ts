import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../../services/matching.service';
import { SwipeCardComponent } from '../../components/swipe-card/swipe-card.component';
import { MatchModalComponent } from '../../components/match-modal/match-modal.component';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { User } from '../../../../core/models/user.model';

import { FiltersModalComponent } from '../../components/filters-modal/filters-modal.component';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, SwipeCardComponent, MatchModalComponent, RouterLink, FiltersModalComponent],
  template: `
    <div class="min-h-screen bg-ivory flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <button routerLink="/feed" class="text-sage font-bold text-xl hover:scale-105 transition-transform">Sama Link</button>
        
        <div class="flex items-center gap-2">
             <h1 class="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Suggestions</h1>
             <button (click)="filterModal.open()" class="p-2 text-slate-400 hover:text-sage transition-colors rounded-full hover:bg-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
             </button>
        </div>
      </header>

      <main class="flex-grow container mx-auto max-w-lg p-4 relative flex flex-col items-center justify-center">
        <!-- Loading State -->
        <div *ngIf="matchingService.isLoading()" class="flex flex-col items-center py-20 animate-pulse">
          <div class="w-64 h-96 bg-slate-200 rounded-3xl mb-8"></div>
          <h3 class="text-lg font-bold text-slate-400">Recherche de profils...</h3>
          <p class="text-sm text-slate-300">Nous cherchons des personnes compatibles à proximité</p>
        </div>

        <!-- Empty State / No more users -->
        <div *ngIf="!matchingService.isLoading() && matchingService.suggestions().length === 0" class="text-center py-20 px-6">
          <div class="text-6xl mb-6">🏝️</div>
          <h2 class="text-2xl font-bold text-night mb-2">C'est tout pour aujourd'hui !</h2>
          <p class="text-slate-500 mb-8 max-w-xs mx-auto">Revenez plus tard pour découvrir de nouveaux profils ou réglez vos filtres.</p>
          <button (click)="filterModal.open()" class="btn btn-outline mb-4">Ajuster les filtres</button>
          
          <button (click)="matchingService.loadSuggestions()" class="block w-full btn btn-primary rounded-full px-8">Réessayer</button>
        </div>

        <!-- Discovery Stack -->
        <div *ngIf="!matchingService.isLoading() && matchingService.suggestions().length > 0" class="w-full relative h-[600px] flex items-center justify-center">
          <app-swipe-card 
            *ngFor="let user of [matchingService.suggestions()[0]]"
            [user]="user"
            (onPass)="onPass(user)"
            (onLike)="onLike(user)"
            class="animate-reveal">
          </app-swipe-card>
        </div>
      </main>

      <!-- Modals -->
      <app-filters-modal #filterModal></app-filters-modal>

      <app-match-modal
        [isOpen]="isMatchModalOpen()"
        [matchedUser]="matchedUser()"
        (close)="closeMatch()"
        (message)="goToChat()">
      </app-match-modal>
    </div>
  `
})
export class SuggestionsComponent implements OnInit {
  matchingService = inject(MatchingService);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  
  isMatchModalOpen = signal(false);
  matchedUser = signal<User | null>(null);
  currentMatchId = signal<string | null>(null);

  ngOnInit() {
    this.title.setTitle('Rencontrer des Gens au Sénégal | Trouve des Affinités Amoureuses');
    this.meta.updateTag({ name: 'description', content: 'Explorez des profils authentiques basés sur des affinités réelles. Sama Link vous aide à trouver l\'amour à Dakar et partout au Sénégal.' });
    this.meta.updateTag({ rel: 'canonical', href: 'https://samalink.sn/matching' });
    
    // Charger les suggestions au démarrage (déjà fait dans le constructeur du service, mais on peut forcer ici)
    this.matchingService.loadSuggestions();
  }

  onLike(user: User) {
    this.matchingService.swipe(user.id, 'like').subscribe({
      next: (res) => {
        if (res && res.isMatch) {
          this.matchedUser.set(user);
          this.currentMatchId.set(res.matchId);
          this.isMatchModalOpen.set(true);
        }
      }
    });
  }

  onPass(user: User) {
    this.matchingService.swipe(user.id, 'pass').subscribe();
  }

  closeMatch() {
    this.isMatchModalOpen.set(false);
    this.matchedUser.set(null);
  }

  goToChat() {
    const matchId = this.currentMatchId();
    this.isMatchModalOpen.set(false);
    if (matchId) {
      this.router.navigate(['/messages', matchId]);
    } else {
      this.router.navigate(['/messages']);
    }
  }
}
