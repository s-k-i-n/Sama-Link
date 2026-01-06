import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-night border-t border-slate-100 dark:border-slate-800 flex items-center justify-around z-50 transition-colors duration-300">
      
      <!-- Feed / Flux -->
      <a routerLink="/feed" routerLinkActive="text-sage" class="flex flex-col items-center gap-1 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v4a2 2 0 002 2h4" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12h10M7 16h10" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Flux</span>
      </a>

      <!-- Matching / Rencontres -->
      <a routerLink="/matching" routerLinkActive="text-sage" class="flex flex-col items-center gap-1 text-slate-400">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14l.879 2.121z" />
         </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Match</span>
      </a>

      <!-- Messaging -->
      <a routerLink="/messages" routerLinkActive="text-sage" class="flex flex-col items-center gap-1 text-slate-400">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
         </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
      </a>

      <!-- Profile -->
      <a routerLink="/profile" routerLinkActive="text-sage" class="flex flex-col items-center gap-1 text-slate-400">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
         </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Profil</span>
      </a>

    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
    .active-link {
        color: var(--sage-color, #89A894);
    }
  `]
})
export class BottomNavComponent {}
