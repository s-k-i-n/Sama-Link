import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ModerationService } from '../../../../core/services/moderation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-screen bg-slate-50">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm z-10 relative">
        <button (click)="goBack()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
          ⬅
        </button>
        
        <div class="relative w-10 h-10 flex-shrink-0">
           <div class="w-full h-full rounded-full bg-slate-200 overflow-hidden">
               <div class="w-full h-full flex items-center justify-center bg-amber text-white font-bold">
                 {{ activeChat()?.userAlias?.charAt(0) }}
               </div>
           </div>
        </div>
        
        <div class="flex-grow">
           <h2 class="font-bold text-slate-900">{{ activeChat()?.userAlias }}</h2>
           <span class="text-xs text-green-600 flex items-center gap-1">
             <span class="w-2 h-2 rounded-full bg-green-500"></span> En ligne
           </span>
        </div>

        <button (click)="toggleMenu()" class="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
           ⋮
        </button>

        <!-- Menu -->
        <div 
          *ngIf="isMenuOpen()" 
          class="absolute right-4 top-14 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
             <button 
               (click)="blockUser()"
               class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
               <span>🚫</span> Bloquer l'utilisateur
             </button>
             <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <span>⚠️</span> Signaler
             </button>
          </div>
          <div *ngIf="isMenuOpen()" (click)="toggleMenu()" class="fixed inset-0 z-0"></div>
      </div>

      <!-- Messages Area -->
      <div class="flex-grow overflow-y-auto p-4 space-y-4" #scrollContainer>
         <div *ngIf="!activeChat()" class="flex h-full items-center justify-center">
            <span class="animate-spin text-2xl">⏳</span>
         </div>
         
         <ng-container *ngFor="let msg of activeChat()?.messages">
           <!-- Date Separator (Optional simplified) -->
           
           <div class="flex" [ngClass]="msg.senderId === authService.currentUser()?.id ? 'justify-end' : 'justify-start'">
              <div 
                class="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm relative group"
                [ngClass]="msg.senderId === authService.currentUser()?.id ? 'bg-sage text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'">
                {{ msg.content }}
                
                <div class="text-[10px] opacity-70 mt-1 text-right" [ngClass]="msg.senderId === authService.currentUser()?.id ? 'text-white/80' : 'text-slate-400'">
                   {{ msg.timestamp | date:'shortTime' }}
                   <span *ngIf="msg.senderId === authService.currentUser()?.id">
                     {{ msg.isRead ? '✓✓' : '✓' }}
                   </span>
                </div>
              </div>
           </div>
         </ng-container>
      </div>

      <!-- Input Area -->
      <div class="bg-white p-3 border-t border-slate-200">
         <form (ngSubmit)="send()" class="flex gap-2 items-end max-w-4xl mx-auto">
            <button type="button" class="p-3 text-slate-400 hover:bg-slate-50 rounded-full shrink-0">
               📎
            </button>
            <div class="flex-grow bg-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-sage focus-within:bg-white transition-all">
               <input 
                 [(ngModel)]="newMessage" 
                 name="message"
                 class="w-full bg-transparent border-none focus:ring-0 p-1 max-h-32 resize-none placeholder-slate-400 outline-none" 
                 placeholder="Écrivez un message..." 
                 autocomplete="off"
               >
            </div>
            <button 
              type="submit" 
              [disabled]="!newMessage.trim()"
              class="p-3 bg-sage text-white rounded-full shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-emerald-600 transition-all shrink-0">
               ➤
            </button>
         </form>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  private moderationService = inject(ModerationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeChat = this.chatService.activeChat;
  newMessage = '';
  isMenuOpen = signal(false);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit() {
    this.route.params.subscribe(params => {
       const id = params['id'];
       if (id) {
         this.chatService.setActiveChat(id);
       }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  goBack() {
    this.router.navigate(['/messages']);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  blockUser() {
    const chat = this.activeChat();
    if (chat) {
       this.moderationService.blockUser(chat.userId);
       this.router.navigate(['/messages']);
       // Ideally show a toast here
    }
  }

  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }
}
