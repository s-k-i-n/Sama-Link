import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'sl-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts(); trackBy: trackByFn"
           class="pointer-events-auto transform transition-all duration-300 ease-out animate-in slide-in-from-right-full fade-in"
           [ngClass]="{
             'translate-x-0 opacity-100': true
           }">
        <div class="flex items-center w-full min-w-[300px] max-w-xs p-4 rounded-xl shadow-xl bg-white border-l-4"
             [ngClass]="getBorderClass(toast.type)">
          <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
               [ngClass]="getIconBgClass(toast.type)">
            <span class="font-bold text-lg">{{ getIconSymbol(toast.type) }}</span>
          </div>
          <div class="ml-3 text-sm font-medium text-slate-700 break-words flex-grow">{{ toast.message }}</div>
          <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-slate-400 hover:text-slate-900 rounded-lg p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8"
                  (click)="toastService.remove(toast.id)">
            <span class="sr-only">Close</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SlToastContainerComponent {
  toastService = inject(ToastService);

  trackByFn(index: number, toast: Toast) {
    return toast.id;
  }

  getBorderClass(type: Toast['type']) {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-amber';
      case 'info': return 'border-sage';
      default: return 'border-slate-300';
    }
  }

  getIconBgClass(type: Toast['type']) {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-600';
      case 'error': return 'bg-red-50 text-red-600';
      case 'warning': return 'bg-amber/10 text-amber';
      case 'info': return 'bg-sage/10 text-sage';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  getIconSymbol(type: Toast['type']) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }
}
