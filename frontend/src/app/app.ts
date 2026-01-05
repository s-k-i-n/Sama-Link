import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SlToastContainerComponent } from './shared/ui/sl-toast/sl-toast-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlToastContainerComponent],
  template: `
    <router-outlet></router-outlet>
    <sl-toast-container></sl-toast-container>
  `,
  styleUrl: './app.css',
  // Host binding for dark mode could be done here but service places it on documentElement which is better for Tailwind 'class' mode.
  // We'll just ensure the router outlet is wrapped if we want global background control, 
  // but often 'min-h-screen bg-ivory' is in feature components. 
  // We should enforce a global background default.
  host: {
    'class': 'block min-h-screen bg-ivory dark:bg-night text-night dark:text-ivory transition-colors duration-300'
  }
})
export class App {
  protected readonly title = signal('sama-link');
}
