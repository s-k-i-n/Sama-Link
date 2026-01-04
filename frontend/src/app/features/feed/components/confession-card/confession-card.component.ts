import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { Confession } from '../../../../core/models/confession.model';

@Component({
  selector: 'app-confession-card',
  standalone: true,
  imports: [CommonModule, SlCardComponent],
  template: `
    <sl-card class="mb-4 hover:border-sage/30 transition-colors">
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
        <button class="text-slate-300 hover:text-night">
          <span class="sr-only">Options</span>
          •••
        </button>
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
    </sl-card>
  `
})
export class ConfessionCardComponent {
  @Input({ required: true }) confession!: Confession;
  @Output() like = new EventEmitter<string>();

  onLike() {
    this.like.emit(this.confession.id);
  }
}
