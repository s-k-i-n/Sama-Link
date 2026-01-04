import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SlButtonComponent, SlInputComponent, SlCardComponent],
  template: `
    <div class="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-night mb-2">Bon retour !</h1>
          <p class="text-slate-600">Connectez-vous pour retrouver vos confessions.</p>
        </div>

        <sl-card>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <sl-input 
              label="Email" 
              type="email" 
              formControlName="email"
              placeholder="votre@email.com"
              [error]="getError('email')"
            ></sl-input>

            <div>
              <sl-input 
                label="Mot de passe" 
                type="password" 
                formControlName="password"
                placeholder="••••••••"
                [error]="getError('password')"
              ></sl-input>
              <div class="flex justify-end mt-1">
                <a routerLink="/auth/forgot-password" class="text-sm text-sage hover:text-emerald-700 font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <sl-button variant="primary" [block]="true" size="lg" [disabled]="isLoading() || loginForm.invalid">
              {{ isLoading() ? 'Connexion en cours...' : 'Se connecter' }}
            </sl-button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ? 
            <a routerLink="/auth/register" class="text-sage hover:text-emerald-700 font-bold">
              Créer un compte
            </a>
          </div>
        </sl-card>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  getError(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return 'Mot de passe trop court';
    }
    return '';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      // Simulate API call for now (since backend isn't ready)
      setTimeout(() => {
        // Mock success
        this.authService.login('mock-token', { email: this.loginForm.value.email });
        this.isLoading.set(false);
        this.router.navigate(['/onboarding']); // Redirect to onboarding for this Sprint flow
      }, 1500);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
