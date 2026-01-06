import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-4 left-4 right-4 h-16 bg-white/70 dark:bg-night/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl flex items-center justify-around z-50 shadow-2xl shadow-sage/10 transition-all duration-500 hover:scale-[1.01]">
      
      <!-- Feed / Flux -->
      <a routerLink="/feed" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v4a2 2 0 002 2h4" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12h10M7 16h10" />
          </svg>
        </div>
        <span class="label">Flux</span>
      </a>

      <!-- Matching / Rencontres -->
      <a routerLink="/matching" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14l.879 2.121z" />
         </svg>
        </div>
        <span class="label">Match</span>
      </a>

      <!-- Messaging -->
      <a routerLink="/messages" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
         </svg>
        </div>
        <span class="label">Chat</span>
      </a>

      <!-- Profile -->
      <a routerLink="/profile" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
         </svg>
        </div>
        <span class="label">Profil</span>
      </a>

    </nav>
  `,
  styles: [`
    .nav-item {
      @apply flex flex-col items-center gap-1 text-slate-400 no-underline transition-all duration-300;
      -webkit-tap-highlight-color: transparent;
    }
    .icon-wrapper {
      @apply p-2 rounded-xl transition-all duration-300;
    }
    .label {
      @apply text-[10px] font-bold uppercase tracking-tighter opacity-0 -translate-y-1 transition-all duration-300;
    }
    .active-link {
      @apply text-sage;
    }
    .active-link .icon-wrapper {
      @apply bg-sage/10 scale-110 shadow-inner;
    }
    .active-link .label {
      @apply opacity-100 translate-y-0 text-sage;
    }
    .nav-item:hover .icon-wrapper {
      @apply bg-slate-100 dark:bg-slate-800 scale-105;
    }
  `]
})
export class BottomNavComponent {}
