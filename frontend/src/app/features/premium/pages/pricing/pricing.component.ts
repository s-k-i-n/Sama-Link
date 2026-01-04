import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { ProfileService } from '../../../profile/services/profile.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, PaymentModalComponent, SlButtonComponent],
  template: `
    <div class="min-h-screen bg-slate-50 pb-20">
       <div class="relative bg-night py-16 px-4 text-center overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute inset-0 bg-gradient-to-r from-night via-slate-900 to-night z-0"></div>
          <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          
          <div class="relative z-10 max-w-2xl mx-auto">
             <div class="inline-block px-3 py-1 mb-4 rounded-full bg-gradient-to-r from-amber to-orange-500 text-white text-xs font-bold tracking-widest uppercase animate-pulse">
                Premium
             </div>
             <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Passez au niveau supérieur
             </h1>
             <p class="text-slate-400 text-lg">
                Débloquez tout le potentiel de Sama Link et faites des rencontres exceptionnelles.
             </p>
          </div>
       </div>

       <div class="max-w-md mx-auto -mt-8 px-4 relative z-20 space-y-6">
          
          <!-- Plans Loop -->
          <div *ngFor="let plan of paymentService.plans" class="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105">
             <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                   <div>
                      <h3 class="text-xl font-bold text-slate-900">{{ plan.name }}</h3>
                      <div class="flex items-baseline mt-1">
                         <span class="text-3xl font-extrabold text-night">{{ plan.price }} FCFA</span>
                         <span class="text-slate-500 text-sm">{{ plan.period }}</span>
                      </div>
                   </div>
                   <span *ngIf="plan.discount" class="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                      {{ plan.discount }}
                   </span>
                </div>

                <sl-button 
                   [variant]="plan.id === 'yearly' ? 'primary' : 'secondary'"
                   [block]="true"
                   (click)="openPayment(plan)"
                   class="mb-6">
                   Choisir {{ plan.name }}
                </sl-button>

                <ul class="space-y-3">
                   <li *ngFor="let feature of plan.features" class="flex items-center text-sm text-slate-600">
                      <span class="mr-2 text-green-500">✓</span> {{ feature }}
                   </li>
                </ul>
             </div>
          </div>

          <div class="text-center">
             <button (click)="goBack()" class="text-slate-400 font-medium hover:text-slate-600">
                Non merci, je reste gratuit pour le moment
             </button>
          </div>

          <!-- Terms -->
          <p class="text-xs text-center text-slate-300 px-6">
             En vous abonnant, vous acceptez nos Conditions Générales de Vente. Abonnement renouvelable automatiquement.
          </p>

       </div>

       <!-- Modal -->
       <app-payment-modal
         [isOpen]="isModalOpen()"
         [planName]="selectedPlan()?.name || ''"
         [amount]="selectedPlan()?.price || 0"
         [isProcessing]="paymentService.isProcessing()"
         (closeMatch)="closeModal()"
         (pay)="processPayment($event)"
       ></app-payment-modal>
    </div>
  `
})
export class PricingComponent {
  paymentService = inject(PaymentService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  isModalOpen = signal(false);
  selectedPlan = signal<any>(null);

  openPayment(plan: any) {
    this.selectedPlan.set(plan);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedPlan.set(null);
  }

  async processPayment(provider: 'card' | 'wave') {
    const success = await this.paymentService.processPayment(this.selectedPlan().id, provider);
    if (success) {
      this.profileService.updateProfile({ isPremium: true });
      this.closeModal();
      this.router.navigate(['/profile']);
      // Should show success toast here
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
