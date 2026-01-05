import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-ivory">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <button routerLink="/feed" class="text-xl font-bold text-sage hover:scale-105 transition-transform">Sama Link</button>
        <h1 class="text-sm font-bold text-night uppercase tracking-wider">Messages</h1>
        <div class="w-10"></div> <!-- Balance -->
      </div>

      <!-- List -->
      <div class="divide-y divide-slate-100">
        <div 
          *ngFor="let chat of chatService.conversations()" 
          (click)="openChat(chat.id)"
          class="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100">
          
          <!-- Avatar -->
          <div class="relative w-14 h-14 flex-shrink-0">
             <div class="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                <img *ngIf="chat.userPhotoUrl" [src]="chat.userPhotoUrl" loading="lazy" [alt]="'Photo de ' + chat.userAlias" class="w-full h-full object-cover">
                <div *ngIf="!chat.userPhotoUrl" class="w-full h-full flex items-center justify-center bg-amber text-white font-bold text-lg">
                  {{ chat.userAlias.charAt(0) }}
                </div>
             </div>
             <!-- Online Badge (Mock) -->
             <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <!-- Content -->
          <div class="flex-grow overflow-hidden">
             <div class="flex justify-between items-baseline mb-1">
                <h3 class="font-bold text-slate-900 truncate">{{ chat.userAlias }}</h3>
                <span class="text-xs text-slate-400 flex-shrink-0">{{ chat.lastMessageTime | date:'shortTime' }}</span>
             </div>
             <div class="flex justify-between items-center">
                <p 
                  class="truncate text-sm pr-4" 
                  [ngClass]="chat.unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'">
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
  private router = inject(Router);

  openChat(id: string) {
    this.router.navigate(['/messages', id]);
  }
}
