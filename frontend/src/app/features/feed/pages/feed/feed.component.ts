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
    <div class="min-h-screen bg-ivory dark:bg-night transition-colors duration-500">
      <!-- Top Bar / Header -->
      <header class="sticky top-0 z-30 bg-white/70 dark:bg-night/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50">
        <div class="container mx-auto max-w-2xl px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shadow-lg shadow-sage/20">
              <span class="text-white font-black text-xs">S</span>
            </div>
            <h1 class="text-xl font-black text-night dark:text-white tracking-tighter">Sama <span class="text-sage">Link</span></h1>
          </div>
          
          <div class="flex gap-3 items-center">
            <!-- Theme Toggle -->
            <button (click)="toggleTheme()" class="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300">
              <span class="text-lg">{{ profileService.settings().theme === 'light' ? '🌙' : '☀️' }}</span>
            </button>

            <!-- User Profile -->
            <ng-container *ngIf="authService.isAuthenticated(); else guestView">
              <div class="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-800">
                <button 
                  routerLink="/profile"
                  class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm hover:scale-110 active:scale-95 transition-all duration-300">
                  <img *ngIf="authService.currentUser()?.avatarUrl" [src]="authService.currentUser()?.avatarUrl" loading="lazy" alt="Profile" class="w-full h-full object-cover">
                  <div *ngIf="!authService.currentUser()?.avatarUrl" class="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                    {{ authService.currentUser()?.username?.substring(0, 2)?.toUpperCase() }}
                  </div>
                </button>
              </div>
            </ng-container>

            <ng-template #guestView>
              <a routerLink="/auth/login" class="text-xs font-black uppercase tracking-widest text-white bg-sage px-5 py-2.5 rounded-2xl shadow-lg shadow-sage/20 hover:scale-105 active:scale-95 transition-all">
                Connexion
              </a>
            </ng-template>
          </div>
        </div>
      </header>

      <!-- Feed Content -->
      <main class="container mx-auto max-w-2xl px-4 py-8">
        <!-- Create Trigger -->
        <div 
          (click)="openCreateModal()"
          class="mb-8 group bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-sage/30 hover:shadow-xl hover:shadow-sage/5 transition-all duration-500">
           <div class="w-12 h-12 rounded-2xl bg-sage/10 dark:bg-slate-800 flex items-center justify-center text-xl transition-transform group-hover:rotate-12 duration-300">
             ✨
           </div>
           <div class="text-slate-400 dark:text-slate-500 flex-grow bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-3 text-sm font-medium border border-transparent group-hover:border-sage/10 transition-all">
             Exprimez-vous anonymement...
           </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-3 overflow-x-auto pb-6 mb-2 no-scrollbar scroll-smooth">
          <button 
            *ngFor="let filter of [
              {id: 'recent', label: 'Récents', icon: '🕒'},
              {id: 'popular', label: 'Populaires', icon: '🔥'},
              {id: 'nearby', label: 'Proximité', icon: '📍'},
              {id: 'mine', label: 'Les miennes', icon: '👤'}
            ]"
            (click)="changeFilter(filter.id)"
            class="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 border"
            [ngClass]="feedService.filterSig() === filter.id 
              ? 'bg-sage text-white border-sage shadow-lg shadow-sage/20 scale-105' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-sage/30 hover:text-sage'">
            <span>{{ filter.icon }}</span>
            {{ filter.label }}
          </button>
        </div>
        
        <!-- Bulk Actions -->
        <div *ngIf="feedService.filterSig() === 'mine' && feedService.confessions().length > 0" class="mb-6 flex justify-end">
          <button 
            (click)="confirmDeleteAll()"
            class="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-red-100 dark:border-red-500/20">
            🗑️ Tout supprimer
          </button>
        </div>
 
         <!-- List / Empty State -->
         <div class="space-y-6">
            <app-confession-card 
              *ngFor="let confession of feedService.confessions()" 
              [confession]="confession"
              (like)="feedService.toggleLike($event)"
            ></app-confession-card>
            
            <!-- Empty State -->
            <div *ngIf="!feedService.isLoading() && feedService.confessions().length === 0" class="py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div class="text-7xl mb-6 grayscale opacity-50">🍃</div>
               <h3 class="text-2xl font-black text-night dark:text-white mb-3 tracking-tighter">Silencio...</h3>
               <p class="text-sm text-slate-400 dark:text-slate-500 px-12 leading-relaxed font-medium">
                 {{ feedService.filterSig() === 'mine' 
                    ? "C'est le moment idéal pour partager votre premier secret en toute sécurité." 
                    : "Aucune confession trouvée ici. Soyez le premier à briser le silence !" }}
               </p>
               <button 
                 *ngIf="feedService.filterSig() !== 'recent'"
                 (click)="feedService.setFilter('recent')"
                 class="mt-8 text-sage font-black uppercase tracking-widest text-xs hover:underline underline-offset-8">
                 Retourner à la source
               </button>
            </div>
         </div>

        <!-- Infinite Scroll Trigger -->
        <div class="py-12 flex flex-col items-center gap-3">
           <div class="w-6 h-6 border-2 border-sage/20 border-t-sage rounded-full animate-spin"></div>
           <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Chargement universel...</span>
        </div>
      </main>

      <!-- FAB (Mobile) -->
      <button 
        (click)="openCreateModal()"
        class="fixed bottom-24 right-6 w-16 h-16 bg-sage text-white rounded-[2rem] shadow-2xl shadow-sage/40 flex items-center justify-center text-4xl transition-all hover:scale-110 hover:-rotate-12 active:scale-90 z-40 md:hidden border-4 border-white dark:border-night">
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

  changeFilter(filterId: string) {
    this.feedService.setFilter(filterId as any);
  }

  ngOnInit() {
    this.title.setTitle('Flux Confessions | Découvrez les secrets de votre communauté au Sénégal');
    this.meta.updateTag({ name: 'description', content: 'Découvrez des confessions anonymes, partagez vos pensées et connectez-vous avec des gens authentiques à Dakar et au Sénégal.' });
    this.meta.updateTag({ rel: 'canonical', href: 'https://samalink.sn/feed' });
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
