import { Routes } from '@angular/router';

export const LIKES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/likes-list/likes-list.ts').then(m => m.LikesListComponent)
  }
];
