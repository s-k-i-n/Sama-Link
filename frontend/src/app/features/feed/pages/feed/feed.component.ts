import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { ConfessionCardComponent } from '../../components/confession-card/confession-card.component';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { CreateConfessionModalComponent } from '../../components/create-confession-modal/create-confession-modal.component';
import { ProfileService } from '../../../profile/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, ConfessionCardComponent, CreateConfessionModalComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-ivory dark:bg-night pb-20 transition-colors duration-300">
      <!-- Top Bar -->
      <div class="sticky top-0 z-30 bg-white/80 dark:bg-night/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div class="container mx-auto max-w-2xl px-4 py-3 flex justify-between items-center">
          <h1 class="text-xl font-bold text-sage">Sama Link</h1>
          <div class="flex gap-2 items-center">
            
            <!-- Dark Mode Toggle -->
            <button (click)="toggleTheme()" class="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {{ profileService.settings().theme === 'light' ? '🌙' : '☀️' }}
            </button>

            <!-- User Profile / Auth -->
            <ng-container *ngIf="authService.isAuthenticated(); else guestView">
              <button 
                routerLink="/profile"
                class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                <img *ngIf="authService.currentUser()?.profilePhotoUrl" [src]="authService.currentUser()?.profilePhotoUrl" class="w-full h-full object-cover">
              </button>
              <button (click)="authService.logout()" class="text-xs text-slate-500 hover:text-red-500 font-medium ml-1">Quitter</button>
            </ng-container>

            <ng-template #guestView>
              <a routerLink="/auth/login" class="text-sm font-bold text-sage px-3 py-1 border border-sage rounded-full hover:bg-sage hover:text-white transition-all">
                Connexion
              </a>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Feed Content -->
      <main class="container mx-auto max-w-2xl px-4 py-6">
        <!-- Create Trigger (Mobile friendly) -->
        <div class="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer" (click)="openCreateModal()">
           <div class="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"></div>
           <div class="text-slate-400 flex-grow bg-slate-50 rounded-full px-4 py-2 text-sm">
             Partagez une confession anonyme...
           </div>
        </div>

        <!-- Filters (Scrollable) -->
        <div class="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          <button 
            (click)="feedService.setFilter('recent')"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            [ngClass]="feedService.filterSig() === 'recent' ? 'bg-night text-white' : 'bg-white border border-slate-200 text-slate-600'">
            Récents
          </button>
          <button 
            (click)="feedService.setFilter('popular')"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            [ngClass]="feedService.filterSig() === 'popular' ? 'bg-amber text-white border-amber' : 'bg-white border border-slate-200 text-slate-600'">
            Populaires 🔥
          </button>
          <button 
            (click)="feedService.setFilter('nearby')"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            [ngClass]="feedService.filterSig() === 'nearby' ? 'bg-sage text-white border-sage' : 'bg-white border border-slate-200 text-slate-600'">
            Proximité 📍
          </button>
          <button 
            (click)="feedService.setFilter('mine')"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            [ngClass]="feedService.filterSig() === 'mine' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'">
            Mes confessions
          </button>
        </div>
        
        <!-- Bulk Actions -->
        <div *ngIf="feedService.filterSig() === 'mine' && feedService.confessions().length > 0" class="mb-4 flex justify-end">
          <button 
            (click)="confirmDeleteAll()"
            class="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
            🗑️ Supprimer toutes mes confessions
          </button>
        </div>
 
         <!-- List / Empty State -->
         <div class="space-y-4">
            <app-confession-card 
              *ngFor="let confession of feedService.confessions()" 
              [confession]="confession"
              (like)="feedService.toggleLike($event)"
            ></app-confession-card>
            
            <!-- Empty State -->
            <div *ngIf="!feedService.isLoading() && feedService.confessions().length === 0" class="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div class="text-6xl mb-4">🍃</div>
               <h3 class="text-lg font-bold text-slate-400 mb-2">Presque trop calme ici...</h3>
               <p class="text-sm text-slate-400 px-6">
                 {{ feedService.filterSig() === 'mine' 
                    ? "Vous n'avez pas encore publié de confession ou vous venez de tout supprimer." 
                    : "Aucune confession ne correspond à ce filtre pour le moment." }}
               </p>
               <button 
                 *ngIf="feedService.filterSig() !== 'recent'"
                 (click)="feedService.setFilter('recent')"
                 class="mt-6 text-sage font-bold hover:underline">
                 Retourner au flux récent
               </button>
            </div>
         </div>

        <!-- Infinite Scroll Trigger -->
        <div class="py-8 text-center text-slate-400 text-sm">
           Chargement plus de confessions...
        </div>
      </main>

      <!-- Floating Action Button (Mobile) -->
      <button 
        (click)="openCreateModal()"
        class="fixed bottom-6 right-6 w-14 h-14 bg-sage text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition-transform hover:scale-110 active:scale-95 z-40 md:hidden">
        +
      </button>

      <!-- Create Modal -->
      <app-create-confession-modal #createModal></app-create-confession-modal>
    </div>
  `
})
export class FeedComponent implements OnInit {
  feedService = inject(FeedService);
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  private title = inject(Title);
  private meta = inject(Meta);
  
  @ViewChild('createModal') createModal!: CreateConfessionModalComponent;

  ngOnInit() {
    this.title.setTitle('Flux Confessions | Découvrez les secrets de votre communauté au Sénégal');
    this.meta.updateTag({ name: 'description', content: 'Partage tes confessions les plus profondes ou découvre celles des autres. Rejoins des milliers de personnes qui se confient en toute sécurité.' });
  }

  openCreateModal() {
    this.createModal.open();
  }

  toggleTheme() {
    const current = this.profileService.settings().theme;
    this.profileService.updateSettings({ theme: current === 'light' ? 'dark' : 'light' });
  }

  confirmDeleteAll() {
    if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos confessions ? Cette action est irréversible.')) {
      this.feedService.deleteAllMyConfessions().subscribe({
        next: (res) => alert(res.message),
        error: (err) => alert('Erreur lors de la suppression groupée')
      });
    }
  }
}
