import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';

import { VerificationComponent } from './pages/verification/verification.component';

export const PROFILE_ROUTES: Routes = [
  { path: '', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'verification', component: VerificationComponent }
];
