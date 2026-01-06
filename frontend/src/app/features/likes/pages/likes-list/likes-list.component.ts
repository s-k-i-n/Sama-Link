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
          <div class="flex items-center gap-2">
             <div class="px-3 py-1 bg-sage/10 text-sage rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ likes().length }} Likes Reçus
             </div>
          </div>
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
           <div *ngFor="let user of likes()" class="relative group cursor-pointer" [routerLink]="['/profile', user.id]">
              <!-- Card -->
              <div class="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white dark:border-slate-800 shadow-xl shadow-sage/5 bg-white relative">
                 <img [src]="user.avatarUrl || 'assets/placeholder.png'" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt="Avatar">
                 
                 <!-- Overlay Gradient -->
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                 <!-- User Info -->
                 <div class="absolute bottom-4 left-4 right-4 text-white">
                    <p class="font-bold text-sm truncate">{{ user.username }}</p>
                    <p class="text-[10px] opacity-80">{{ user.age }} ans • {{ user.location || 'Sénégal' }}</p>
                 </div>
              </div>
           </div>
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

  ngOnInit() {
    this.loadLikes();
  }

  loadLikes() {
    this.isLoading.set(true);
    this.matchingService.getWhoLikedMe().subscribe({
      next: (data: any[]) => {
        this.likes.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastService.error("Impossible de charger les likes.");
        this.isLoading.set(false);
      }
    });
  }
}
