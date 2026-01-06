import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../../../matching/services/matching.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-likes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-ivory pb-20">
      <header class="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 sticky top-0 z-20 flex items-center justify-between">
         <h1 class="text-xl font-black text-night italic">Likes reçus</h1>
         <button routerLink="/premium" class="btn btn-primary btn-sm rounded-full bg-gold hover:bg-gold-dark border-none shadow-lg shadow-gold/20">
            Sama Gold 👑
         </button>
      </header>

      <main class="container mx-auto p-4 max-w-lg">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="grid grid-cols-2 gap-4 animate-pulse">
           <div *ngFor="let i of [1,2,3,4]" class="aspect-[3/4] bg-slate-200 rounded-3xl"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && likes().length === 0" class="text-center py-20 px-6">
           <div class="text-6xl mb-6">🏜️</div>
           <h2 class="text-2xl font-bold text-night mb-2">Pas encore de likes...</h2>
           <p class="text-slate-500 mb-8">Ne vous inquiétez pas, continuez à swiper pour vous faire remarquer !</p>
           <button routerLink="/matching" class="btn btn-primary rounded-full px-8">Commencer à matcher</button>
        </div>

        <!-- Likes Grid -->
        <div *ngIf="!isLoading() && likes().length > 0" class="grid grid-cols-2 gap-4">
           <div *ngFor="let user of likes()" class="relative group cursor-pointer" [routerLink]="user.isBlurred ? '/premium' : ['/profile', user.id]">
              <!-- Card -->
              <div class="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white dark:border-slate-800 shadow-xl shadow-sage/5 bg-white relative">
                 <img [src]="user.avatarUrl || 'assets/placeholder.png'" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      [class.blur-xl]="user.isBlurred"
                      [class.grayscale]="user.isBlurred"
                      alt="Avatar">
                 
                 <!-- Overlay Gradient -->
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                 <!-- User Info (Masked if blurred) -->
                 <div class="absolute bottom-4 left-4 right-4 text-white">
                    <p class="font-bold text-sm truncate">{{ user.username }}</p>
                    <p class="text-[10px] opacity-80" *ngIf="!user.isBlurred">{{ user.age }} ans • {{ user.location || 'Sénégal' }}</p>
                 </div>

                 <!-- Premium Badge Overlay -->
                 <div *ngIf="user.isBlurred" class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div class="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Premium CTA for Free Users -->
        <div *ngIf="!isLoading() && hasBlurredLikes()" class="mt-8 p-6 bg-gold/10 rounded-3xl border border-gold/20 text-center animate-reveal">
           <h3 class="text-gold-dark font-black text-lg mb-2">Découvrez qui vous a liké !</h3>
           <p class="text-sm text-slate-600 mb-6">Passez à **Sama Gold** pour voir tous les profils et matcher instantanément.</p>
           <button routerLink="/premium" class="w-full btn btn-primary bg-gold hover:bg-gold-dark border-none rounded-full shadow-lg">
              Devenir Premium 👑
           </button>
        </div>
      </main>
    </div>
  `
})
export class LikesListComponent implements OnInit {
  private matchingService = inject(MatchingService);
  private toastService = inject(ToastService);

  likes = signal<any[]>([]);
  isLoading = signal(true);
  hasBlurredLikes = signal(false);

  ngOnInit() {
    this.loadLikes();
  }

  loadLikes() {
    this.isLoading.set(true);
    this.matchingService.getWhoLikedMe().subscribe({
      next: (data: any[]) => {
        this.likes.set(data);
        this.hasBlurredLikes.set(data.some((u: any) => u.isBlurred));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastService.error("Impossible de charger les likes.");
        this.isLoading.set(false);
      }
    });
  }
}
