import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-swipe-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full max-w-sm mx-auto h-[600px] group">
      <!-- Card Container -->
      <div class="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sage/10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-500 group-hover:shadow-sage/20 group-hover:border-sage/20 flex flex-col relative">
        
        <!-- Photo Area -->
        <div class="h-2/3 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
           <!-- Overlay Gradient -->
           <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
           
           <div *ngIf="user.avatarUrl; else placeholder" class="w-full h-full">
              <img [src]="user.avatarUrl" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Profile">
           </div>
           <ng-template #placeholder>
              <div class="w-full h-full flex items-center justify-center text-5xl opacity-20 grayscale">
                 👤
              </div>
           </ng-template>

           <!-- Status Badge (Top Right) -->
           <div class="absolute top-5 right-5 z-20 flex gap-2">
              <div *ngIf="user.verificationStatus === 'VERIFIED'" class="bg-blue-500/90 backdrop-blur-md text-white p-2 rounded-xl shadow-lg" title="Vérifié">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                 </svg>
              </div>
              <div class="bg-white/90 backdrop-blur-md text-night px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                 <span class="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                 En ligne
              </div>
           </div>

           <!-- User Brief (Bottom Overlay) -->
           <div class="absolute bottom-6 left-6 right-6 z-20">
              <div class="flex items-end justify-between">
                <div>
                  <h2 class="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                    {{ user.username }}, <span class="font-medium opacity-90">{{ user.age || '?' }}</span>
                  </h2>
                  <p class="text-white/80 text-xs font-bold flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    {{ user.location || 'Sénégal' }} • 3km
                  </p>
                </div>
              </div>
           </div>
        </div>

        <!-- Info Area -->
        <div class="p-6 flex-grow flex flex-col justify-between dark:bg-slate-900 transition-colors">
          <div class="space-y-4">
            <!-- Bio -->
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
              {{ user.bio || "Pas de bio pour le moment, mais je suis sûrement quelqu'un de super sympa ! ✨" }}
            </p>

            <!-- Interests -->
            <div class="flex flex-wrap gap-2">
               <span *ngFor="let interest of (user.interests || ['Voyage', 'Musique', 'Art'])" 
                     class="px-3 py-1 rounded-full bg-sage/5 dark:bg-slate-800 text-sage dark:text-sage text-[10px] font-black uppercase tracking-widest border border-sage/10">
                 {{ interest }}
               </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Indicators (Visible during swipe) -->
      <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
          <!-- Like Hint -->
          <div class="like-label border-mint text-mint -rotate-12 absolute left-10 top-20 text-3xl font-black uppercase px-4 py-2 border-4 rounded-2xl hidden group-hover:block">LIKE</div>
          <!-- Nope Hint -->
          <div class="nope-label border-red-500 text-red-500 rotate-12 absolute right-10 top-20 text-3xl font-black uppercase px-4 py-2 border-4 rounded-2xl hidden group-hover:block">NOPE</div>
      </div>
    </div>

    <!-- Controls (External to card usually but here for simple UI) -->
    <div class="flex justify-center gap-6 mt-8">
      <button 
        (click)="pass.emit(user)"
        class="w-16 h-16 rounded-full bg-white shadow-lg border border-slate-100 text-slate-400 flex items-center justify-center text-2xl hover:bg-slate-50 hover:text-red-500 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-200">
        ✖
      </button>

      <button 
        (click)="like.emit(user)"
        class="w-16 h-16 rounded-full bg-sage shadow-lg shadow-sage/30 text-white flex items-center justify-center text-3xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sage/50">
        ❤️
      </button>
    </div>
  `
})
export class SwipeCardComponent {
  @Input({ required: true }) user!: User;
  @Output() like = new EventEmitter<User>();
  @Output() pass = new EventEmitter<User>();
}
