import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        loadChildren: () => import('./features/feed/feed.routes').then(m => m.FEED_ROUTES)
      },
      {
        path: 'matching',
        loadChildren: () => import('./features/matching/matching.routes').then(m => m.MATCHING_ROUTES)
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messaging/messaging.routes').then(m => m.MESSAGING_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'premium',
        loadChildren: () => import('./features/premium/premium.routes').then(m => m.PREMIUM_ROUTES)
      },
      {
        path: 'likes-me',
        loadChildren: () => import('./features/likes/likes.routes').then(m => m.LIKES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
