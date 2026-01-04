import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlButtonComponent, SlInputComponent, SlCardComponent],
  template: `
    <div class="min-h-screen bg-ivory py-10 px-4 flex flex-col items-center">
      <!-- Progress Bar -->
      <div class="w-full max-w-lg mb-8">
        <div class="flex justify-between mb-2 text-sm font-medium text-slate-500">
          <span>Étape {{ currentStep() }} sur 4</span>
          <span>{{ progress() }}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2.5">
          <div class="bg-sage h-2.5 rounded-full transition-all duration-300" [style.width.%]="progress()"></div>
        </div>
      </div>

      <div class="w-full max-w-lg">
        <sl-card>
          <form [formGroup]="onboardingForm" (ngSubmit)="onSubmit()">
            
            <!-- Step 1: Bio & Avatar (Text only for now) -->
            <div *ngIf="currentStep() === 1">
              <h2 class="text-2xl font-bold text-night mb-4">Parlez-nous de vous</h2>
              <p class="text-slate-600 mb-6">Une courte bio pour vous présenter aux autres membres.</p>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-1">Votre Bio</label>
                <textarea 
                  formControlName="bio"
                  rows="4"
                  class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-night focus:border-night transition-shadow resize-none"
                  placeholder="J'aime la musique, les voyages et..."
                ></textarea>
                <p class="mt-1 text-sm text-slate-500 text-right">{{ bioCount() }}/160</p>
              </div>
            </div>

            <!-- Step 2: Location -->
            <div *ngIf="currentStep() === 2">
              <h2 class="text-2xl font-bold text-night mb-4">Où êtes-vous ?</h2>
              <p class="text-slate-600 mb-6">Sama Link est principalement actif au Sénégal.</p>
              
              <div class="space-y-4">
                 <div class="p-4 border border-sage/50 bg-sage/5 rounded-lg flex items-center">
                    <span class="text-2xl mr-3">🇸🇳</span>
                    <div>
                      <h3 class="font-medium">Sénégal</h3>
                      <p class="text-sm text-slate-500">Dakar et régions</p>
                    </div>
                    <div class="ml-auto text-sage">✔</div>
                 </div>
                 
                 <sl-input 
                    label="Ville / Quartier" 
                    formControlName="location"
                    placeholder="Ex: Dakar, Mermoz"
                 ></sl-input>
              </div>
            </div>

            <!-- Step 3: Preferences -->
            <div *ngIf="currentStep() === 3">
              <h2 class="text-2xl font-bold text-night mb-4">Vos préférences</h2>
              <p class="text-slate-600 mb-6">Que recherchez-vous ici ?</p>
              
              <div class="space-y-4">
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                       [class.border-sage]="onboardingForm.get('intent')?.value === 'friendship'">
                  <input type="radio" formControlName="intent" value="friendship" class="h-4 w-4 text-sage focus:ring-sage border-slate-300">
                  <span class="ml-3 font-medium">Amitié & Discussions</span>
                </label>
                
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                       [class.border-sage]="onboardingForm.get('intent')?.value === 'dating'">
                  <input type="radio" formControlName="intent" value="dating" class="h-4 w-4 text-sage focus:ring-sage border-slate-300">
                  <span class="ml-3 font-medium">Rencontre sérieuse</span>
                </label>

                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                       [class.border-sage]="onboardingForm.get('intent')?.value === 'confession'">
                  <input type="radio" formControlName="intent" value="confession" class="h-4 w-4 text-sage focus:ring-sage border-slate-300">
                  <span class="ml-3 font-medium">Juste pour confesser</span>
                </label>
              </div>
            </div>

            <!-- Step 4: Rules -->
            <div *ngIf="currentStep() === 4">
              <h2 class="text-2xl font-bold text-night mb-4">Charte de confiance</h2>
              <p class="text-slate-600 mb-6">Pour garantir une expérience sûre et bienveillante.</p>
              
              <ul class="space-y-4 mb-8">
                <li class="flex items-start">
                  <span class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-sage/10 text-sage font-bold text-sm mr-3">1</span>
                  <span class="text-slate-700">Je m'engage à rester respectueux dans mes échanges.</span>
                </li>
                <li class="flex items-start">
                  <span class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-sage/10 text-sage font-bold text-sm mr-3">2</span>
                  <span class="text-slate-700">Je ne partagerai pas de contenu inapproprié ou illégal.</span>
                </li>
                <li class="flex items-start">
                  <span class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-sage/10 text-sage font-bold text-sm mr-3">3</span>
                  <span class="text-slate-700">Je protégerai ma vie privée et celle des autres.</span>
                </li>
              </ul>

              <label class="flex items-center">
                <input type="checkbox" formControlName="acceptRules" class="h-5 w-5 text-sage focus:ring-sage border-slate-300 rounded">
                <span class="ml-3 text-sm text-slate-700 font-medium">J'accepte les règles de la communauté</span>
              </label>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <sl-button type="button" variant="ghost" (click)="prevStep()" [disabled]="currentStep() === 1">
                Précédent
              </sl-button>
              
              <sl-button *ngIf="currentStep() < 4" type="button" variant="primary" (click)="nextStep()">
                Suivant
              </sl-button>
              
              <sl-button *ngIf="currentStep() === 4" variant="primary" [disabled]="onboardingForm.invalid || isLoading()">
                {{ isLoading() ? 'Finalisation...' : 'Commencer l\'aventure' }}
              </sl-button>
            </div>

          </form>
        </sl-card>
      </div>
    </div>
  `,
  styles: []
})
export class OnboardingWizardComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentStep = signal(1);
  isLoading = signal(false);
  
  onboardingForm = this.fb.group({
    bio: ['', [Validators.maxLength(160)]],
    location: ['Dakar', Validators.required],
    intent: ['friendship', Validators.required],
    acceptRules: [false, Validators.requiredTrue]
  });

  bioCount = computed(() => {
    return this.onboardingForm.get('bio')?.value?.length || 0;
  });

  progress = computed(() => {
    return (this.currentStep() / 4) * 100;
  });

  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    if (this.onboardingForm.valid) {
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
        this.authService.completeOnboarding();
        // Navigate to Feed (not yet implemented, so go home for now)
        this.router.navigate(['/']);
      }, 1500);
    }
  }
}
