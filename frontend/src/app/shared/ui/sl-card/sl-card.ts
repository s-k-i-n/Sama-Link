import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sl-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6" [ngClass]="class">
      <ng-content></ng-content>
    </div>
  `
})
export class SlCardComponent {
  @Input() class: string = '';
}
