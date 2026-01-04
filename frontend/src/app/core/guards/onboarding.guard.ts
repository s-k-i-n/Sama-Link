import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not auth, let AuthGuard handle it (should be chained or check here)
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Check if onboarding is complete
  if (authService.hasCompletedOnboarding()) {
      return true;
  }

  // If not complete, redirect to onboarding wizard
  return router.createUrlTree(['/onboarding']);
};
