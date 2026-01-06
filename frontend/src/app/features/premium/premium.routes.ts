import { Routes } from '@angular/router';

export const PREMIUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/premium/premium').then(m => m.PremiumComponent)
  }
];
