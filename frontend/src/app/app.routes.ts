import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES)
  },
  {
    path: 'feed',
    loadChildren: () => import('./features/feed/feed.routes').then(m => m.FEED_ROUTES)
    // In real app, apply AuthGuard here
  },
  { path: '', redirectTo: 'feed', pathMatch: 'full' }
];
