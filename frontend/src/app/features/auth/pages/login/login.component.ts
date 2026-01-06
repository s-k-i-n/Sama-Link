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
    <div class="min-h-screen bg-ivory flex items-center justify-center p-4 relative">
      <!-- Back to Home -->
      <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-sage transition-colors font-medium">
        <span class="text-xl">←</span>
        <span>RETOUR</span>
      </a>

      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-night mb-2">Bon retour !</h1>
          <p class="text-slate-600">Connectez-vous pour retrouver vos confessions.</p>
        </div>

        <sl-card>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <sl-input 
              label="Identifiant" 
              type="text" 
              formControlName="identifier"
              placeholder="Email, téléphone ou pseudo"
              [error]="getError('identifier')"
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
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  getError(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['minlength']) return 'Mot de passe trop court';
    }
    return '';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      
      const { identifier, password } = this.loginForm.value;

      this.authService.login(identifier!, password!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/feed']); 
        },
        error: (err: any) => {
          this.isLoading.set(false);
          alert(err.error?.message || 'Erreur lors de la connexion');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
