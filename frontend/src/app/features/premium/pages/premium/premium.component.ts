import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-premium',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-night text-white pb-20 overflow-x-hidden">
      <!-- Header / Back -->
      <header class="p-4 flex items-center justify-between sticky top-0 z-50 bg-night/80 backdrop-blur-md">
        <button (click)="goBack()" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 class="text-xl font-black italic tracking-tighter text-gold">SAMA LINK GOLD</h1>
        <div class="w-10"></div>
      </header>

      <main class="container mx-auto px-6 max-w-lg pt-8">
        <!-- Hero Section -->
        <div class="text-center mb-12 animate-reveal">
           <div class="w-24 h-24 bg-gradient-to-br from-gold to-orange-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gold/20 rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-night" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.711 4 1.99C12.454 3.711 13.943 3 15.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
           </div>
           <h2 class="text-4xl font-black mb-4">Passez au niveau supérieur</h2>
           <p class="text-slate-400">Débloquez des fonctionnalités exclusives pour multiplier vos chances de rencontre.</p>
        </div>

        <!-- Benefits List -->
        <div class="space-y-6 mb-12">
           <div *ngFor="let benefit of benefits" class="flex items-start gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-gold/30 transition-all">
              <div class="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                 <span class="text-xl">{{ benefit.icon }}</span>
              </div>
              <div>
                 <h3 class="font-bold text-lg">{{ benefit.title }}</h3>
                 <p class="text-sm text-slate-400">{{ benefit.desc }}</p>
              </div>
           </div>
        </div>

        <!-- Pricing Options -->
        <div class="space-y-4 mb-12">
           <div *ngFor="let plan of plans" 
                (click)="selectPlan(plan)"
                class="relative p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden"
                [class.border-gold]="selectedPlanId() === plan.id"
                [class.bg-gold/5]="selectedPlanId() === plan.id"
                [class.border-white/10]="selectedPlanId() !== plan.id">
              
              <div *ngIf="plan.badge" class="absolute top-0 right-0 bg-gold text-night text-[10px] font-black px-4 py-1 rounded-bl-2xl">
                 {{ plan.badge }}
              </div>

              <div class="flex items-center justify-between">
                 <div>
                    <h4 class="text-xl font-black">{{ plan.name }}</h4>
                    <p class="text-slate-400 text-sm">{{ plan.desc }}</p>
                 </div>
                 <div class="text-right">
                    <p class="text-2xl font-black">{{ plan.price }}</p>
                    <p class="text-[10px] text-slate-500 uppercase font-bold">{{ plan.period }}</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- CTA Action -->
        <button (click)="onSubscribe()" 
                [disabled]="isSubmitting()"
                class="w-full h-16 btn btn-primary bg-gradient-to-r from-gold to-orange-500 hover:from-gold-dark hover:to-orange-600 border-none rounded-full shadow-2xl shadow-gold/20 flex items-center justify-center gap-3 transition-transform active:scale-95 group">
           <span *ngIf="!isSubmitting()" class="text-night font-black text-lg tracking-tight capitalize">
              {{ 'S\'abonner à ' + (getSelectedPlan()?.name || 'Sama Gold') }}
           </span>
           <span *ngIf="isSubmitting()" class="loading loading-spinner text-night"></span>
           <svg *ngIf="!isSubmitting()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-night group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </button>

        <p class="text-center text-[10px] text-slate-500 mt-6 px-4">
           Le paiement sera débité de votre compte Sama Link. L'abonnement se renouvelle automatiquement sauf s'il est annulé au moins 24 heures avant la fin de la période en cours.
        </p>

      </main>
    </div>
  `,
  styles: [`
    @keyframes reveal {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-reveal {
      animation: reveal 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
  `]
})
export class PremiumComponent {
  private router = inject(Router);
  private subService = inject(SubscriptionService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  benefits = [
    { icon: '⭐', title: 'Super Likes illimités', desc: 'Faites-vous remarquer 5x plus avec nos Super Likes quotidiens.' },
    { icon: '⏩', title: 'Rewind illimité', desc: 'Vous avez swipé trop vite ? Revenez en arrière instantanément.' },
    { icon: '👀', title: 'Qui vous a liké ?', desc: 'Voyez exactement qui a flashé sur vous et matchez directement.' },
    { icon: '🌍', title: 'Passeport', desc: 'Matchez avec des personnes partout dans le monde.' }
  ];

  plans = [
    { id: '1week', name: '1 Semaine', price: '2 500 FCFA', period: '7 jours', desc: 'Essai rapide', planType: 'GOLD' },
    { id: '1month', name: '1 Mois', price: '7 500 FCFA', period: '30 jours', desc: 'Le plus populaire', planType: 'GOLD', badge: 'MEILLEUR PRIX' },
    { id: '6month', name: '6 Mois', price: '30 000 FCFA', period: '180 jours', desc: 'Économie maximale', planType: 'PLATINUM' }
  ];

  selectedPlanId = signal('1month');
  isSubmitting = signal(false);

  selectPlan(plan: any) {
    this.selectedPlanId.set(plan.id);
  }

  getSelectedPlan() {
    return this.plans.find(p => p.id === this.selectedPlanId());
  }

  goBack() {
    this.router.navigate(['/matching']);
  }

  onSubscribe() {
    const plan = this.getSelectedPlan();
    if (!plan) return;

    this.isSubmitting.set(true);
    // Simulation du paiement
    this.subService.subscribe(plan.planType as any).subscribe({
      next: (res) => {
        this.toastService.success(res.message);
        this.isSubmitting.set(false);
        this.router.navigate(['/matching']);
      },
      error: (err) => {
        this.toastService.error("Le paiement a échoué. Veuillez réessayer.");
        this.isSubmitting.set(false);
      }
    });
  }
}
