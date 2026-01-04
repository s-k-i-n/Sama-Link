import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  isProcessing = signal(false);

  // Mock Plans
  plans = [
    {
      id: 'monthly',
      name: 'Mensuel',
      price: 2500,
      currency: 'FCFA',
      period: '/mois',
      features: ['Likes illimités', 'Voir qui vous like', 'Retour en arrière', 'Pas de publicités']
    },
    {
      id: 'yearly',
      name: 'Annuel',
      price: 20000,
      currency: 'FCFA',
      period: '/an', 
      discount: '-33%',
      features: ['Tout du plan mensuel', 'Badge "Gold" Exclusif', '3 Boosts par mois', 'Support prioritaire']
    }
  ];

  processPayment(planId: string, provider: 'card' | 'wave'): Promise<boolean> {
    this.isProcessing.set(true);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        this.isProcessing.set(false);
        resolve(true); // Always succeed for mock
      }, 2000);
    });
  }
}
