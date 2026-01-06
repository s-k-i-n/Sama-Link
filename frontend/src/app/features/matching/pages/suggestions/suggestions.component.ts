import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../../services/matching.service';
import { SwipeCardComponent } from '../../components/swipe-card/swipe-card.component';
import { MatchModalComponent } from '../../components/match-modal/match-modal.component';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/services/toast.service';

import { FiltersModalComponent } from '../../components/filters-modal/filters-modal.component';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, SwipeCardComponent, MatchModalComponent, RouterLink, FiltersModalComponent],
  template: `
    <div class="min-h-screen bg-ivory dark:bg-night flex flex-col transition-colors duration-500">
      <header class="sticky top-0 z-30 bg-white/70 dark:bg-night/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex justify-between items-center transition-colors duration-500">
        <a routerLink="/feed" class="flex items-center gap-2 hover:scale-[1.02] transition-transform">
          <div class="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shadow-lg shadow-sage/20 text-white font-black text-sm">s</div>
          <h1 class="text-xl font-black flex items-center tracking-tighter">
            <span class="text-night dark:text-white">Sama</span>
            <span class="text-sage ml-1">Link</span>
          </h1>
        </a>
        
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
            
            <!-- Action Buttons (Bottom) -->
             <div class="absolute -bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-6">
                 <!-- Rewind -->
                 <button (click)="onRewind()" class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-amber hover:bg-amber hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-amber/20" title="Annuler (Premium)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                 </button>

                 <!-- Pass (Small) -->
                  <button (click)="triggerSwipe('pass')" class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>

                 <!-- Super Like -->
                 <button (click)="triggerSwipe('superlike')" class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-blue-100 relative group" title="Super Like">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                 </button>
                 
                  <!-- Like (Small) -->
                   <button (click)="triggerSwipe('like')" class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-mint hover:bg-mint hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                 </button>
             </div>

          <app-swipe-card 
            *ngFor="let user of [matchingService.suggestions()[0]]"
            [user]="user"
            class="animate-reveal z-10">
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
  toastService = inject(ToastService);
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
    
    // Charger les suggestions au démarrage
    this.matchingService.loadSuggestions();
  }
  
  triggerSwipe(direction: 'like' | 'pass' | 'superlike') {
      // Logic to trigger swipe programmatically on the current card
      // Ideally access the SwipeCardComponent child, but for now we manually call service for top card
      const currentUser = this.matchingService.suggestions()[0];
      if (!currentUser) return;

      if (direction === 'like') this.onLike(currentUser);
      if (direction === 'pass') this.onPass(currentUser);
      if (direction === 'superlike') this.onSuperLike(currentUser);
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

  onSuperLike(user: User) {
       this.matchingService.swipe(user.id, 'superlike').subscribe({
          next: (res) => {
            if (res && res.isMatch) {
              this.matchedUser.set(user);
              this.currentMatchId.set(res.matchId);
              this.isMatchModalOpen.set(true);
            }
             this.toastService.show('Super Like envoyé ! ⭐', 'success');
          },
          error: (err) => {
              // Usually 400 if limit reached
              this.toastService.show(err.error?.message || "Erreur Super Like", 'error');
          }
       });
  }

  onPass(user: User) {
    this.matchingService.swipe(user.id, 'pass').subscribe();
  }

  onRewind() {
      this.matchingService.rewind().subscribe({
          next: (res) => {
              this.toastService.show('Action annulée ! ⏪', 'info');
              // Reload suggestions to potentially bring back the person? 
              // Or simple re-insert logic if we had local history.
              // For simplicity: reload
              this.matchingService.loadSuggestions();
          },
          error: (err) => {
              this.toastService.show(err.error?.message || "Rewind impossible (Premium?)", 'warning');
          }
      });
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
