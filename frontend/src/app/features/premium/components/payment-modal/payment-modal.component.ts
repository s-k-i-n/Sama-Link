import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlModalComponent } from '../../../../shared/ui/sl-modal/sl-modal';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, SlModalComponent, SlButtonComponent, SlInputComponent, FormsModule],
  template: `
    <sl-modal [isOpen]="isOpen" title="Paiement Sécurisé" (closed)="close()">
       <div class="space-y-6">
          <!-- Summary -->
          <div class="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-100">
             <div>
                <h4 class="font-bold text-slate-800">{{ planName }}</h4>
                <p class="text-sm text-slate-500">Abonnement Sama Link Premium</p>
             </div>
             <div class="text-right">
                <span class="block text-xl font-bold text-night">{{ amount }} FCFA</span>
             </div>
          </div>

          <!-- Provider Selection -->
          <div>
             <label class="block text-sm font-medium text-slate-700 mb-2">Choisir un moyen de paiement</label>
             <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  (click)="provider.set('card')"
                  class="p-3 border rounded-lg flex items-center justify-center gap-2 transition-all"
                  [ngClass]="provider() === 'card' ? 'border-sage bg-sage/5 ring-1 ring-sage' : 'border-slate-200 hover:border-slate-300'">
                  <span class="text-xl">💳</span> Carte Bancaire
                </button>
                <button 
                  type="button" 
                  (click)="provider.set('wave')"
                  class="p-3 border rounded-lg flex items-center justify-center gap-2 transition-all"
                  [ngClass]="provider() === 'wave' ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500' : 'border-slate-200 hover:border-slate-300'">
                  <span class="text-xl text-sky-500">🌊</span> Wave
                </button>
             </div>
          </div>

          <!-- Mock Forms -->
          <div [ngSwitch]="provider()">
             
             <!-- Card Form -->
             <div *ngSwitchCase="'card'" class="space-y-3 animate-in fade-in">
                <sl-input label="Numéro de carte" placeholder="0000 0000 0000 0000"></sl-input>
                <div class="grid grid-cols-2 gap-3">
                   <sl-input label="Expiration" placeholder="MM/YY"></sl-input>
                   <sl-input label="CVC" placeholder="123"></sl-input>
                </div>
             </div>

             <!-- Wave Form -->
             <div *ngSwitchCase="'wave'" class="space-y-3 animate-in fade-in">
                  <div class="bg-sky-50 p-4 rounded-lg text-sky-800 text-sm">
                     Scannez le QR code ou entrez votre numéro pour valider sur l'application Wave.
                  </div>
                  <sl-input label="Numéro de téléphone" placeholder="+221 77 ..."></sl-input>
             </div>

          </div>

          <!-- Pay Button -->
          <sl-button 
            (click)="onPay()" 
            [disabled]="isProcessing" 
            [block]="true" 
            variant="primary">
            <span *ngIf="!isProcessing; else loading">Payer {{ amount }} FCFA</span>
            <ng-template #loading>Traitement en cours...</ng-template>
          </sl-button>
          
          <p class="text-xs text-center text-slate-400 mt-2">
             Paiement 100% sécurisé (Simulation)
          </p>
       </div>
    </sl-modal>
  `
})
export class PaymentModalComponent {
  @Input() isOpen = false;
  @Input() planName = '';
  @Input() amount = 0;
  @Input() isProcessing = false;
  
  @Output() closeMatch = new EventEmitter<void>();
  @Output() pay = new EventEmitter<'card' | 'wave'>();

  provider = signal<'card' | 'wave'>('card');

  close() {
    this.closeMatch.emit();
  }

  onPay() {
    this.pay.emit(this.provider());
  }
}
