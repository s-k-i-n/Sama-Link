import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sl-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="classes" [disabled]="disabled" (click)="handleClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class SlButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() block: boolean = false;
  @Input() disabled = false;

  get classes(): string {
    const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-night text-ivory hover:bg-slate-800 focus:ring-slate-900',
      secondary: 'bg-sage text-white hover:bg-emerald-700 focus:ring-emerald-500',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base'
    };
    
    const width = this.block ? 'w-full' : '';
    
    return `${base} ${variants[this.variant]} ${sizes[this.size]} ${width}`;
  }

  handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
