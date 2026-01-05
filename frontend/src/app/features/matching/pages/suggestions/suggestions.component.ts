import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../../services/matching.service';
import { SwipeCardComponent } from '../../components/swipe-card/swipe-card.component';
import { MatchModalComponent } from '../../components/match-modal/match-modal.component';
import { User } from '../../../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, SwipeCardComponent, MatchModalComponent],
  template: `
    <div class="min-h-screen bg-ivory flex flex-col">
      <!-- Header -->
      <div class="py-4 px-6 text-center">
        <h1 class="text-xl font-bold text-night">Suggestions pour vous</h1>
      </div>

      <!-- Main Content -->
      <div class="flex-grow flex items-center justify-center p-4 relative">
        
        <!-- Loading State -->
        <div *ngIf="matchingService.suggestions().length === 0" class="text-center p-8 bg-white/50 rounded-2xl">
          <div class="text-4xl mb-4 animate-spin">⏳</div>
          <h3 class="text-lg font-bold text-slate-700">Recherche de profils...</h3>
          <p class="text-slate-500">Nous cherchons des personnes compatibles à proximité.</p>
          <button (click)="matchingService.loadSuggestions()" class="mt-4 px-4 py-2 bg-sage text-white rounded-lg hover:bg-emerald-600 transition-colors">
             Réessayer
          </button>
        </div>

        <!-- Stack (Only showing first one for simple MVP) -->
        <ng-container *ngIf="matchingService.suggestions().length > 0">
           <app-swipe-card 
             *ngFor="let user of [matchingService.suggestions()[0]]"
             [user]="user"
             (pass)="onPass($event)"
             (like)="onLike($event)"
             class="animate-in fade-in zoom-in duration-300 transform"
           ></app-swipe-card>
        </ng-container>

      </div>

      <!-- Match Modal -->
      <app-match-modal 
        [isOpen]="isMatchModalOpen()" 
        [matchedUser]="matchedUser()"
        (closeMatch)="closeMatchModal()"
        (message)="goToChat()"
      ></app-match-modal>
    </div>
  `
})
export class SuggestionsComponent {
  matchingService = inject(MatchingService);
  router = inject(Router);
  
  isMatchModalOpen = signal(false);
  matchedUser = signal<User | null>(null);

  onLike(user: User) {
    this.matchingService.swipe(user.id, 'like').subscribe({
      next: (res) => {
        if (res && res.isMatch) {
          this.matchedUser.set(user);
          this.isMatchModalOpen.set(true);
        }
      }
    });
  }

  onPass(user: User) {
    this.matchingService.swipe(user.id, 'pass').subscribe();
  }

  closeMatchModal() {
    this.isMatchModalOpen.set(false);
    this.matchedUser.set(null);
  }

  goToChat() {
    this.closeMatchModal();
    this.router.navigate(['/messaging']);
  }
}
