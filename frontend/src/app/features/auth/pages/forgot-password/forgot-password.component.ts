import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';

@Component({
  selector: 'app-forgot-password',
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
          <h1 class="text-3xl font-bold text-night mb-2">Mot de passe oublié ?</h1>
          <p class="text-slate-600">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        </div>

        <sl-card *ngIf="!submitted(); else successTpl">
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <sl-input 
              label="Email" 
              type="email" 
              formControlName="email"
              placeholder="votre@email.com"
              [error]="getError('email')"
            ></sl-input>

            <sl-button variant="primary" [block]="true" size="lg" [disabled]="isLoading() || forgotForm.invalid">
              {{ isLoading() ? 'Envoi en cours...' : 'Envoyer le lien' }}
            </sl-button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-600">
            <a routerLink="/auth/login" class="text-sage hover:text-emerald-700 font-bold">
              Retour à la connexion
            </a>
          </div>
        </sl-card>

        <ng-template #successTpl>
          <sl-card class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✉️
            </div>
            <h3 class="text-xl font-bold text-night mb-2">Email envoyé !</h3>
            <p class="text-slate-600 mb-6">
              Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.
            </p>
            <sl-button variant="ghost" routerLink="/auth/login" [block]="true">
              Retour à la connexion
            </sl-button>
          </sl-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  
  isLoading = signal(false);
  submitted = signal(false);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  getError(controlName: string): string {
    const control = this.forgotForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
    }
    return '';
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      setTimeout(() => {
        // Mock success
        this.isLoading.set(false);
        this.submitted.set(true);
      }, 1500);
    }
  }
}
