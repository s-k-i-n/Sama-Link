import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BottomNavComponent],
  template: `
    <div class="min-h-screen pb-16 bg-ivory dark:bg-night transition-colors duration-300">
      <router-outlet></router-outlet>
      <app-bottom-nav></app-bottom-nav>
    </div>
  `
})
export class MainLayoutComponent {}
