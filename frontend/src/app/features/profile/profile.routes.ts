import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const PROFILE_ROUTES: Routes = [
  { path: '', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent }
];
