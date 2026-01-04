import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'sl-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show()"
         class="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out"
         [ngClass]="{
           'translate-y-0 opacity-100': show(),
           'translate-y-2 opacity-0': !show()
         }">
      <div class="flex items-center w-full max-w-xs p-4 rounded-lg shadow bg-white border-l-4"
           [ngClass]="getBorderClass()">
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
             [ngClass]="getIconBgClass()">
          <span class="font-bold text-lg">{{ getIconSymbol() }}</span>
        </div>
        <div class="ml-3 text-sm font-normal text-slate-700 break-words max-w-[200px]">{{ message() }}</div>
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8"
                (click)="dismiss()">
          <span class="sr-only">Close</span>
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class SlToastComponent {
  message = signal('');
  type = signal<ToastType>('info');
  show = signal(false);
  private timer: any;

  // This would typically be controlled by a service, 
  // but for the UI component itself, we offer public methods.
  
  present(msg: string, type: ToastType = 'info', duration = 3000) {
    this.message.set(msg);
    this.type.set(type);
    this.show.set(true);

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  dismiss() {
    this.show.set(false);
  }

  getBorderClass() {
    switch (this.type()) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-amber';
      default: return 'border-night';
    }
  }

  getIconBgClass() {
    switch (this.type()) {
      case 'success': return 'bg-green-100 text-green-500';
      case 'error': return 'bg-red-100 text-red-500';
      case 'warning': return 'bg-orange-100 text-amber';
      default: return 'bg-slate-100 text-night';
    }
  }

  getIconSymbol() {
    switch (this.type()) {
      case 'success': return '✓';
      case 'error': return '!';
      case 'warning': return '⚠';
      default: return 'i';
    }
  }
}
