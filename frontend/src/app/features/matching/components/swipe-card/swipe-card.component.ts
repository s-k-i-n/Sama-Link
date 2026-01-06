import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-swipe-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full max-w-sm mx-auto h-[600px] rounded-2xl overflow-hidden shadow-xl bg-white border border-slate-100 flex flex-col">
      <!-- Photo Area (Mocked with color gradient for now) -->
      <div class="h-3/5 bg-gradient-to-br from-slate-200 to-slate-300 relative">
         <div *ngIf="user.avatarUrl; else placeholder" class="w-full h-full">
            <img [src]="user.avatarUrl" class="w-full h-full object-cover" alt="Profile of {{ user.username }}">
         </div>
         <ng-template #placeholder>
            <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
               <span class="text-6xl">👤</span>
            </div>
         </ng-template>
         
         <!-- Badges -->
         <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-sage">
           {{ user.compatibilityScore }}% Compatible
         </div>
         <div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
           {{ user.distance }} km
         </div>
      </div>

      <!-- Info Area -->
      <div class="flex-grow p-6 flex flex-col">
         <div class="mb-2">
           <h2 class="text-2xl font-bold text-night">{{ user.username }}, {{ user.age }}</h2>
           <p class="text-slate-500 text-sm">{{ user.location }}</p>
         </div>

         <p class="text-slate-600 italic mb-4 line-clamp-3">"{{ user.bio }}"</p>

         <div class="flex flex-wrap gap-2 mt-auto mb-6">
            <span *ngFor="let interest of user.interests" class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
               {{ interest }}
            </span>
         </div>
      </div>

      <!-- Action Overlay (For swipe animation later) -- Not implemented fully yet -->
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
