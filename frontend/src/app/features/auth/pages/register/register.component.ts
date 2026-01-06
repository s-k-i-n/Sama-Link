import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h1 class="text-3xl font-bold text-night mb-2">Rejoindre Sama Link</h1>
          <p class="text-slate-600">Rejoignez la communauté en toute liberté.</p>
        </div>

        <sl-card>
          <!-- Step 1: Credentials -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <sl-input 
              label="Nom d'utilisateur (Anonyme)" 
              type="text" 
              formControlName="username"
              placeholder="Pseudo"
              hint="Ce nom sera visible par les autres utilisateurs."
              [error]="getError('username')"
            ></sl-input>

            <!-- Auth Method Selector -->
            <div class="flex gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="authMethod" value="email" class="text-sage focus:ring-sage">
                <span class="text-sm font-medium text-slate-700">Email</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="authMethod" value="phone" class="text-sage focus:ring-sage">
                <span class="text-sm font-medium text-slate-700">Téléphone</span>
              </label>
            </div>

            <sl-input 
              *ngIf="registerForm.get('authMethod')?.value === 'email'"
              label="Email" 
              type="email" 
              formControlName="email"
              placeholder="votre@email.com"
              hint="Ne sera jamais affiché publiquement."
              [error]="getError('email')"
            ></sl-input>

            <sl-input 
              *ngIf="registerForm.get('authMethod')?.value === 'phone'"
              label="Téléphone" 
              type="tel" 
              formControlName="phone"
              placeholder="+221 77 123 45 67"
              hint="Format: 771234567 ou +22177..."
              [error]="getError('phone')"
            ></sl-input>

            <sl-input 
              label="Mot de passe" 
              type="password" 
              formControlName="password"
              placeholder="••••••••"
              [error]="getError('password')"
            ></sl-input>

            <sl-input 
              label="Confirmer le mot de passe" 
              type="password" 
              formControlName="confirmPassword"
              placeholder="••••••••"
              [error]="getError('confirmPassword')"
            ></sl-input>

            <sl-button variant="primary" [block]="true" size="lg" [disabled]="isLoading() || registerForm.invalid">
              {{ isLoading() ? 'Création en cours...' : 'Créer mon compte' }}
            </sl-button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-600">
            Déjà un compte ? 
            <a routerLink="/auth/login" class="text-sage hover:text-emerald-700 font-bold">
              Se connecter
            </a>
          </div>
        </sl-card>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    authMethod: ['email'],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    // Dynamic validation
    this.registerForm.get('authMethod')?.valueChanges.subscribe(method => {
      const emailControl = this.registerForm.get('email');
      const phoneControl = this.registerForm.get('phone');

      if (method === 'email') {
        emailControl?.setValidators([Validators.required, Validators.email]);
        phoneControl?.clearValidators();
        phoneControl?.setValue('');
      } else {
        phoneControl?.setValidators([Validators.required, Validators.pattern(/^(?:\+221|00221)?(?:7[05678][0-9]{7})$/)]);
        emailControl?.clearValidators();
        emailControl?.setValue('');
      }
      emailControl?.updateValueAndValidity();
      phoneControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
       ? null : { mismatch: true };
  }

  getError(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['pattern']) return 'Format téléphone invalide (Ex: 77 123 45 67)';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
      if (control.errors['mismatch']) return 'Les mots de passe ne correspondent pas';
    }
    if (controlName === 'confirmPassword' && this.registerForm.hasError('mismatch') && control?.touched) {
       return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      
      const { confirmPassword, authMethod, ...userData } = this.registerForm.value;
      // Nettoyer les champs vides
      if (userData.email === '') delete userData.email;
      if (userData.phone === '') delete userData.phone;

      this.authService.register(
        userData.username!, 
        userData.password!, 
        userData.email || undefined, 
        userData.phone || undefined
      ).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/onboarding']);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          alert(err.error?.message || 'Erreur lors de l\'inscription');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
