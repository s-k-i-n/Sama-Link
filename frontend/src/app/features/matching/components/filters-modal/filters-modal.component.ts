import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatchingService, UserPreferences } from '../../services/matching.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';

@Component({
  selector: 'app-filters-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlButtonComponent],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" (click)="close()">
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

          <!-- Passport (Unlocked for Universal Premium) -->
          <div *ngIf="true" class="mb-8 p-4 bg-gold/5 rounded-2xl border border-gold/20">
             <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">🌍</span>
                <h3 class="text-sm font-black text-gold-dark uppercase tracking-tight">Mode Passeport</h3>
             </div>
             <p class="text-[10px] text-slate-500 mb-4">Voyagez virtuellement et matchez avec des personnes partout dans le monde.</p>
             
             <div class="space-y-3">
                <select (change)="selectCity($event)" class="select select-sm select-bordered w-full rounded-xl text-xs bg-white">
                   <option value="">Ma position actuelle</option>
                   <option value="dakar" [selected]="isCity('dakar')">Dakar, Sénégal (Local)</option>
                   <option value="paris" [selected]="isCity('paris')">Paris, France</option>
                   <option value="newyork" [selected]="isCity('newyork')">New York, USA</option>
                   <option value="dubai" [selected]="isCity('dubai')">Dubaï, UAE</option>
                </select>
                <p *ngIf="filterForm.get('passportLatitude')?.value" class="text-[10px] text-sage font-bold italic text-center">
                   📍 Position fixée sur {{ getCityName() }}
                </p>
             </div>
          </div>

          <!-- Premium Upsell (Hidden for Universal Premium) -->
          <div *ngIf="false && !user()?.isPremium" (click)="goToPremium()" class="mb-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
             <div class="flex items-center justify-between">
                <div class="flex flex-col text-left">
                   <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passeport</span>
                   <span class="text-xs font-bold text-slate-600">Voyagez où vous voulez</span>
                </div>
                <span class="text-gold text-lg">👑</span>
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
  private authService = inject(AuthService);
  
  user = this.authService.currentUser;
  
  isOpen = signal(false);
  isLoading = signal(false);

  filterForm = this.fb.group({
    maxDistance: [50],
    minAge: [18],
    maxAge: [35],
    genderPreference: ['all'],
    passportLatitude: [null as number | null],
    passportLongitude: [null as number | null]
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
          genderPreference: prefs.genderPreference || 'all',
          passportLatitude: prefs.passportLatitude,
          passportLongitude: prefs.passportLongitude
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

  selectCity(event: any) {
    const city = event.target.value;
    const coords: Record<string, {lat: number, lng: number} | null> = {
      'dakar': { lat: 14.7167, lng: -17.4677 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'newyork': { lat: 40.7128, lng: -74.0060 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
      '': null
    };

    const selected = coords[city];
    this.filterForm.patchValue({
      passportLatitude: selected?.lat || null,
      passportLongitude: selected?.lng || null
    });
  }

  isCity(city: string): boolean {
    const lat = this.filterForm.get('passportLatitude')?.value;
    const coords: Record<string, number> = { 'dakar': 14.7167, 'paris': 48.8566, 'newyork': 40.7128, 'dubai': 25.2048 };
    return coords[city] === lat;
  }

  getCityName(): string {
     const lat = this.filterForm.get('passportLatitude')?.value;
     if (lat === 14.7167) return 'Dakar';
     if (lat === 48.8566) return 'Paris';
     if (lat === 40.7128) return 'New York';
     if (lat === 25.2048) return 'Dubaï';
     return 'une autre position';
  }

  goToPremium() {
    this.close();
    // Use window.location or router
    window.location.href = '/premium';
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
