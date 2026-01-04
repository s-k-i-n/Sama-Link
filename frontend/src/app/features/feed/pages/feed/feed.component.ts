import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { ConfessionCardComponent } from '../../components/confession-card/confession-card.component';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';

import { CreateConfessionModalComponent } from '../../components/create-confession-modal/create-confession-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, ConfessionCardComponent, CreateConfessionModalComponent],
  template: `
    <div class="min-h-screen bg-ivory pb-20">
      <!-- Top Bar -->
      <div class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div class="container mx-auto max-w-2xl px-4 py-3 flex justify-between items-center">
          <h1 class="text-xl font-bold text-sage">Sama Link</h1>
          <div class="flex gap-2">
            <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              🔍
            </button>
            <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              🔔
            </button>
          </div>
        </div>
      </div>

      <!-- Feed Content -->
      <main class="container mx-auto max-w-2xl px-4 py-6">
        <!-- Create Trigger (Mobile friendly) -->
        <div class="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer" (click)="openCreateModal()">
           <div class="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"></div>
           <div class="text-slate-400 flex-grow bg-slate-50 rounded-full px-4 py-2 text-sm">
             Partagez une confession anonyme...
           </div>
        </div>

        <!-- Filters (Scrollable) -->
        <div class="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          <button class="px-4 py-1.5 bg-night text-white rounded-full text-sm font-medium whitespace-nowrap">Récents</button>
          <button class="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium whitespace-nowrap">Populaires 🔥</button>
          <button class="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium whitespace-nowrap">Proximité 📍</button>
          <button class="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium whitespace-nowrap">Mes confessions</button>
        </div>

        <!-- List -->
        <div class="space-y-4">
           <app-confession-card 
             *ngFor="let confession of feedService.confessions()" 
             [confession]="confession"
             (like)="feedService.toggleLike($event)"
           ></app-confession-card>
        </div>

        <!-- Infinite Scroll Trigger -->
        <div class="py-8 text-center text-slate-400 text-sm">
           Chargement plus de confessions...
        </div>
      </main>

      <!-- Floating Action Button (Mobile) -->
      <button 
        (click)="openCreateModal()"
        class="fixed bottom-6 right-6 w-14 h-14 bg-sage text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition-transform hover:scale-110 active:scale-95 z-40 md:hidden">
        +
      </button>

      <!-- Create Modal -->
      <app-create-confession-modal #createModal></app-create-confession-modal>
    </div>
  `
})
export class FeedComponent {
  feedService = inject(FeedService);
  
  @ViewChild('createModal') createModal!: CreateConfessionModalComponent;

  openCreateModal() {
    this.createModal.open();
  }
}
