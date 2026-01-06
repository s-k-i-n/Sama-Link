import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-4 left-4 right-4 h-18 bg-white/70 dark:bg-night/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800/50 rounded-[2rem] flex items-center justify-around z-50 shadow-2xl shadow-sage/20 transition-all duration-500 hover:scale-[1.01]">
      
      <!-- Feed / Flux -->
      <a routerLink="/feed" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v4a2 2 0 002 2h4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 12h10M7 16h10" />
          </svg>
        </div>
        <span class="label">Flux</span>
      </a>

      <!-- Matching / Rencontres -->
      <a routerLink="/matching" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="label">Match</span>
      </a>

      <!-- Messaging -->
      <a routerLink="/messages" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="label">Chat</span>
      </a>

      <!-- Likes (Who liked me) -->
      <a routerLink="/likes-me" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span class="label">Likes</span>
      </a>

      <!-- Profile -->
      <a routerLink="/profile" routerLinkActive="active-link" class="nav-item">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
      @apply p-2 rounded-2xl transition-all duration-500 flex items-center justify-center;
    }
    .label {
      @apply text-[9px] font-black uppercase tracking-widest opacity-0 -translate-y-1 transition-all duration-500;
    }
    .active-link {
      @apply text-sage;
    }
    .active-link .icon-wrapper {
      @apply bg-sage/10 scale-125 shadow-xl shadow-sage/5 border border-sage/20;
    }
    .active-link .label {
      @apply opacity-100 translate-y-0 text-sage scale-110;
    }
    .nav-item:hover .icon-wrapper {
      @apply bg-slate-100 dark:bg-slate-800 scale-110;
    }
  `]
})
export class BottomNavComponent {}
