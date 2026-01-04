import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlButtonComponent } from '../sl-button/sl-button';

@Component({
  selector: 'sl-modal',
  standalone: true,
  imports: [CommonModule, SlButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
         *ngIf="isOpen()"
         role="dialog"
         aria-modal="true"
         [attr.aria-labelledby]="title">
      
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900/50 transition-opacity" 
           (click)="close()"></div>
      
      <!-- Panel -->
      <div class="relative bg-white rounded-lg shadow-xl transform transition-all sm:w-full sm:max-w-lg overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-medium text-night leading-6">{{ title }}</h3>
          <button (click)="close()" class="text-slate-400 hover:text-slate-500 focus:outline-none">
            <span class="sr-only">Fermer</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-6 py-4">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div class="bg-slate-50 px-6 py-3 flex flex-row-reverse gap-2 border-t border-slate-100">
          <!-- Transcluded actions or defaults -->
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class SlModalComponent {
  @Input() title = '';
  @Input() isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
