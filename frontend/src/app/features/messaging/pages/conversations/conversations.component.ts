import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { MatchingService } from '../../../matching/services/matching.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-ivory dark:bg-night transition-colors duration-500">
      <!-- Header -->
      <header class="sticky top-0 z-30 bg-white/70 dark:bg-night/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex justify-between items-center transition-colors duration-500">
        <a routerLink="/feed" class="flex items-center gap-2 hover:scale-[1.02] transition-transform">
          <div class="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shadow-lg shadow-sage/20 text-white font-black text-sm">s</div>
          <h1 class="text-xl font-black flex items-center tracking-tighter">
            <span class="text-night dark:text-white">Sama</span>
            <span class="text-sage ml-1">Link</span>
          </h1>
        </a>
        <h1 class="text-xs font-black text-night dark:text-white uppercase tracking-[0.2em]">Messages</h1>
        <div class="w-10"></div> <!-- Balance -->
      </header>

      <!-- Connection Requests -->
      <div *ngIf="pendingRequests().length > 0" class="p-4 bg-sage/5 border-b border-sage/10">
         <h4 class="text-[10px] font-black text-sage uppercase tracking-widest mb-3">Demandes de connexion</h4>
         <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div *ngFor="let req of pendingRequests()" class="flex-shrink-0 w-64 bg-white dark:bg-slate-800 rounded-2xl p-3 border border-sage/20 shadow-sm relative group">
               <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden">
                     <img *ngIf="req.userA.avatarUrl" [src]="req.userA.avatarUrl" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500">
                     <div *ngIf="!req.userA.avatarUrl" class="w-full h-full flex items-center justify-center bg-slate-100 text-lg">👤</div>
                  </div>
                  <div class="flex-grow min-w-0">
                     <p class="text-xs font-bold text-night dark:text-white truncate">Quelqu'un via une confession</p>
                     <p class="text-[10px] text-slate-400 truncate italic">"{{ req.confession?.content }}"</p>
                  </div>
               </div>
               <div class="flex gap-2">
                  <button (click)="respond(req.id, 'accept')" class="flex-grow bg-sage text-white text-[10px] font-black py-2 rounded-xl active:scale-95 transition-transform">Accepter</button>
                  <button (click)="respond(req.id, 'decline')" class="px-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-lg active:scale-95 transition-transform">✕</button>
               </div>
            </div>
         </div>
      </div>

      <!-- List -->
      <div class="divide-y divide-slate-100 dark:divide-slate-800/50">
        <div 
          *ngFor="let chat of chatService.conversations()" 
          (click)="openChat(chat.id)"
          class="flex items-center gap-4 p-4 bg-white dark:bg-night hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-slate-800">
          
          <!-- Avatar -->
          <div class="relative w-14 h-14 flex-shrink-0">
             <div class="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                <img *ngIf="chat.userPhotoUrl" [src]="chat.userPhotoUrl" loading="lazy" [alt]="'Photo de ' + chat.userAlias" class="w-full h-full object-cover">
                <div *ngIf="!chat.userPhotoUrl" class="w-full h-full flex items-center justify-center bg-amber text-white font-bold text-lg">
                  {{ (chat.userAlias || 'U').charAt(0) }}
                </div>
             </div>
             <!-- Online Badge (Mock) -->
             <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-night rounded-full"></div>
          </div>

          <!-- Content -->
          <div class="flex-grow overflow-hidden">
             <div class="flex justify-between items-baseline mb-1">
                <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ chat.userAlias }}</h3>
                <span class="text-xs text-slate-400 flex-shrink-0">{{ chat.lastMessageTime | date:'shortTime' }}</span>
             </div>
             <div class="flex justify-between items-center">
                <p 
                  class="truncate text-sm pr-4" 
                  [ngClass]="chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500'">
                  {{ chat.lastMessage }}
                </p>
                <span *ngIf="chat.unreadCount > 0" class="min-w-[1.25rem] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {{ chat.unreadCount }}
                </span>
             </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="chatService.conversations().length === 0" class="text-center py-12 px-4">
           <div class="text-4xl mb-4">📭</div>
           <p class="text-slate-500">Aucune conversation pour le moment.</p>
           <p class="text-sm text-slate-400 mt-2">Allez matcher pour discuter !</p>
        </div>
      </div>
    </div>
  `
})
export class ConversationListComponent {
  chatService = inject(ChatService);
  matchingService = inject(MatchingService);
  private router = inject(Router);

  pendingRequests = signal<any[]>([]);

  constructor() {
    this.loadRequests();
  }

  loadRequests() {
    this.matchingService.getPendingRequests().subscribe({
      next: (data) => this.pendingRequests.set(data),
      error: (err) => console.error('Failed to load pending requests', err)
    });
  }

  respond(matchId: string, action: 'accept' | 'decline') {
    this.matchingService.respondToMatchRequest(matchId, action).subscribe({
      next: () => {
        this.pendingRequests.update(list => list.filter(r => r.id !== matchId));
        if (action === 'accept') {
           this.chatService.loadConversations(); // Reload chat list to see new conversation
        }
      },
      error: (err) => console.error('Failed to respond to match request', err)
    });
  }

  openChat(id: string) {
    this.router.navigate(['/messages', id]);
  }
}
