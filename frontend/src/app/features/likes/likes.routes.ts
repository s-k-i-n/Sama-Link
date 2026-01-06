import { Routes } from '@angular/router';

export const LIKES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/likes-list/likes-list.component').then(m => m.LikesListComponent)
  }
];
