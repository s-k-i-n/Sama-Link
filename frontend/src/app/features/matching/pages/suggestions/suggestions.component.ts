import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../../services/matching.service';
import { SwipeCardComponent } from '../../components/swipe-card/swipe-card.component';
import { MatchModalComponent } from '../../components/match-modal/match-modal.component';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, SwipeCardComponent, MatchModalComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-ivory flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <button routerLink="/feed" class="text-sage font-bold text-xl hover:scale-105 transition-transform">Sama Link</button>
        <h1 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Suggestions</h1>
        <div class="w-10"></div> <!-- Spacer -->
      </header>

      <main class="flex-grow container mx-auto max-w-lg p-4 relative flex flex-col items-center justify-center">
        <!-- Loading State -->
        <div *ngIf="matchingService.loading()" class="flex flex-col items-center py-20 animate-pulse">
          <div class="w-64 h-96 bg-slate-200 rounded-3xl mb-8"></div>
          <h3 class="text-lg font-bold text-slate-400">Recherche de profils...</h3>
          <p class="text-sm text-slate-300">Nous cherchons des personnes compatibles à proximité</p>
        </div>

        <!-- Empty State / No more users -->
        <div *ngIf="!matchingService.loading() && matchingService.suggestions().length === 0" class="text-center py-20 px-6">
          <div class="text-6xl mb-6">🏝️</div>
          <h2 class="text-2xl font-bold text-night mb-2">C'est tout pour aujourd'hui !</h2>
          <p class="text-slate-500 mb-8 max-w-xs mx-auto">Revenez plus tard pour découvrir de nouveaux profils ou partagez une confession pour attirer l'attention.</p>
          <button (click)="matchingService.getSuggestions().subscribe()" class="btn btn-primary rounded-full px-8">Réessayer</button>
        </div>

        <!-- Discovery Stack -->
        <div *ngIf="!matchingService.loading() && matchingService.suggestions().length > 0" class="w-full relative h-[600px] flex items-center justify-center">
          <app-swipe-card 
            *ngFor="let user of [matchingService.suggestions()[0]]"
            [user]="user"
            (onPass)="onPass(user)"
            (onLike)="onLike(user)"
            class="animate-reveal">
          </app-swipe-card>
        </div>
      </main>

      <!-- Match Celebration Modal -->
      <app-match-modal
        [isOpen]="isMatchModalOpen()"
        [matchedUser]="matchedUser()"
        (close)="closeMatch()"
        (message)="goToChat($event)">
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

  ngOnInit() {
    this.title.setTitle('Rencontrer des Gens au Sénégal | Trouve des Affinités Amoureuses');
    this.meta.updateTag({ name: 'description', content: 'Explorez des profils authentiques basés sur des affinités réelles. Sama Link vous aide à trouver l\'amour à Dakar et partout au Sénégal.' });
    
    // Charger les suggestions au démarrage
    this.matchingService.getSuggestions().subscribe();
  }

  onLike(user: User) {
    this.matchingService.swipe(user.id, 'like').subscribe({
      next: (res) => {
        if (res.matchCreated) {
          this.matchedUser.set(user);
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

  goToChat(conversationId: string) {
    this.isMatchModalOpen.set(false);
    this.router.navigate(['/messages', conversationId]);
  }
}
