import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES)
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadChildren: () => import('./features/feed/feed.routes').then(m => m.FEED_ROUTES)
  },
  {
    path: 'matching',
    canActivate: [authGuard],
    loadChildren: () => import('./features/matching/matching.routes').then(m => m.MATCHING_ROUTES)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadChildren: () => import('./features/messaging/messaging.routes').then(m => m.MESSAGING_ROUTES)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },
  {
    path: 'premium',
    canActivate: [authGuard],
    loadChildren: () => import('./features/premium/premium.routes').then(m => m.PREMIUM_ROUTES)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
