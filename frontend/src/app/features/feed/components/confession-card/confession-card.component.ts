import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { Confession } from '../../../../core/models/confession.model';
import { ModerationService } from '../../../../core/services/moderation.service';

@Component({
  selector: 'app-confession-card',
  standalone: true,
  imports: [CommonModule, SlCardComponent],
  template: `
    <sl-card class="mb-4 hover:border-sage/30 transition-colors relative">
      <!-- Header -->
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg mr-2">
            🕵️
          </div>
          <div>
            <span class="font-bold text-slate-700 block text-sm">{{ confession.authorAlias || 'Anonyme' }}</span>
            <span class="text-xs text-slate-400">{{ confession.location }} • {{ confession.createdAt | date:'short' }}</span>
          </div>
        </div>
        
        <div class="relative">
          <button (click)="toggleMenu()" class="text-slate-300 hover:text-night p-1 rounded-full hover:bg-slate-100 transition-colors">
            <span class="sr-only">Options</span>
            •••
          </button>
          
          <!-- Dropdown Menu -->
          <div *ngIf="isMenuOpen()" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
             <button 
               (click)="report()"
               class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
               <span>⚠️</span> Signaler
             </button>
             <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <span>🔗</span> Copier le lien
             </button>
          </div>
          <!-- Backdrop for menu -->
          <div *ngIf="isMenuOpen()" (click)="toggleMenu()" class="fixed inset-0 z-0"></div>
       </div>
      </div>

      <!-- Content -->
      <p class="text-night text-lg leading-relaxed mb-4 whitespace-pre-wrap">{{ confession.content }}</p>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-50">
        <div class="flex space-x-6">
          <button 
            (click)="onLike()" 
            class="flex items-center space-x-1.5 transition-colors group"
            [ngClass]="confession.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'"
          >
            <span class="text-xl group-active:scale-125 transition-transform">
              {{ confession.isLiked ? '❤️' : '🤍' }}
            </span>
            <span class="font-medium text-sm">{{ confession.likes }}</span>
          </button>
          
          <button class="flex items-center space-x-1.5 text-slate-500 hover:text-sage transition-colors">
            <span class="text-xl">💬</span>
            <span class="font-medium text-sm">{{ confession.commentsCount }}</span>
          </button>

          <button class="flex items-center space-x-1.5 text-slate-500 hover:text-amber transition-colors">
            <span class="text-xl">🔗</span>
          </button>
        </div>
      </div>
      
      <!-- Report Success Toast Mock (Inline for MVP) -->
      <div *ngIf="showReportToast()" class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-night text-white text-xs px-3 py-1 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
         Signalement envoyé !
      </div>
    </sl-card>
  `
})
export class ConfessionCardComponent {
  @Input({ required: true }) confession!: Confession;
  @Output() like = new EventEmitter<string>();

  moderationService = inject(ModerationService);
  
  isMenuOpen = signal(false);
  showReportToast = signal(false);

  onLike() {
    this.like.emit(this.confession.id);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  report() {
    this.moderationService.reportContent(this.confession.id, 'confession', 'Contenu inapproprié');
    this.isMenuOpen.set(false);
    this.showReportToast.set(true);
    setTimeout(() => this.showReportToast.set(false), 3000);
  }
}
