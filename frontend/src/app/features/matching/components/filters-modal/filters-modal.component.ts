import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatchingService, UserPreferences } from '../../services/matching.service';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';

@Component({
  selector: 'app-filters-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" (click)="close()">
      <div class="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up" (click)="$event.stopPropagation()">
        
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-night">Filtres</h2>
          <button (click)="close()" class="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
          
          <!-- Distance -->
          <div class="mb-6">
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-slate-700">Distance maximale</label>
              <span class="text-sm text-sage font-bold">{{ filterForm.get('maxDistance')?.value }} km</span>
            </div>
            <input type="range" formControlName="maxDistance" min="5" max="200" step="5" class="w-full accent-sage">
          </div>

          <!-- Age Range -->
          <div class="mb-6">
             <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-slate-700">Tranche d'âge</label>
              <span class="text-sm text-sage font-bold">
                {{ filterForm.get('minAge')?.value }} - {{ filterForm.get('maxAge')?.value }} ans
              </span>
            </div>
            <div class="flex gap-4">
               <div class="w-1/2">
                 <label class="text-xs text-slate-500 mb-1 block">Min</label>
                 <input type="number" formControlName="minAge" min="18" max="99" class="w-full p-2 border rounded-lg">
               </div>
               <div class="w-1/2">
                 <label class="text-xs text-slate-500 mb-1 block">Max</label>
                 <input type="number" formControlName="maxAge" min="18" max="99" class="w-full p-2 border rounded-lg">
               </div>
            </div>
          </div>

          <!-- Gender -->
          <div class="mb-8">
            <label class="text-sm font-medium text-slate-700 mb-2 block">Je veux voir</label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" 
                (click)="setGender('male')"
                [class]="getGenderClass('male')"
                class="p-2 text-sm rounded-lg border transition-colors">
                Hommes
              </button>
              <button type="button" 
                (click)="setGender('female')"
                [class]="getGenderClass('female')"
                class="p-2 text-sm rounded-lg border transition-colors">
                Femmes
              </button>
              <button type="button" 
                (click)="setGender('all')"
                [class]="getGenderClass('all')"
                class="p-2 text-sm rounded-lg border transition-colors">
                Tout
              </button>
            </div>
          </div>

          <sl-button variant="primary" [block]="true" size="lg" [disabled]="isLoading()">
            {{ isLoading() ? 'Application...' : 'Appliquer les filtres' }}
          </sl-button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `]
})
export class FiltersModalComponent {
  private fb = inject(FormBuilder);
  private matchingService = inject(MatchingService);
  
  isOpen = signal(false);
  isLoading = signal(false);

  filterForm = this.fb.group({
    maxDistance: [50],
    minAge: [18],
    maxAge: [35],
    genderPreference: ['all']
  });

  constructor() {
    this.initialLoad();
  }

  initialLoad() {
    this.matchingService.getPreferences().subscribe(prefs => {
      if (prefs) {
        this.filterForm.patchValue({
          maxDistance: prefs.maxDistance,
          minAge: prefs.minAge,
          maxAge: prefs.maxAge,
          genderPreference: prefs.genderPreference || 'all'
        });
      }
    });
  }

  setGender(gender: string) {
    this.filterForm.patchValue({ genderPreference: gender });
  }

  getGenderClass(gender: string) {
    const current = this.filterForm.get('genderPreference')?.value;
    return current === gender 
      ? 'bg-sage text-white border-sage font-medium' 
      : 'bg-white text-slate-600 border-slate-200 hover:border-sage hover:text-sage';
  }

  open() {
    this.isOpen.set(true);
    this.initialLoad(); // Refresh incase it changed
  }
  
  close() {
    this.isOpen.set(false);
  }

  applyFilters() {
    this.isLoading.set(true);
    const formValue = this.filterForm.value;
    
    // Validation basique
    if ((formValue.minAge || 18) > (formValue.maxAge || 99)) {
       // swap logic or error
       const temp = formValue.minAge;
       this.filterForm.patchValue({ minAge: formValue.maxAge, maxAge: temp });
    }

    this.matchingService.updatePreferences(formValue as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close();
      },
      error: () => this.isLoading.set(false)
    });
  }
}
