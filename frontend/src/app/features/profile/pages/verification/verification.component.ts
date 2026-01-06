import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <header class="w-full flex items-center mb-8">
         <button (click)="goBack()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-200 rounded-full">⬅</button>
         <h1 class="text-xl font-bold ml-4">Vérification de Profil</h1>
      </header>

      <div class="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 text-center">
         
         <!-- Status Display -->
         <ng-container [ngSwitch]="status()">
             <div *ngSwitchCase="'VERIFIED'" class="text-green-600 mb-4">
                 <div class="text-5xl mb-2">✅</div>
                 <h2 class="text-2xl font-bold">Vérifié !</h2>
                 <p class="text-slate-600 mt-2">Votre profil est officiel. Vous avez le badge bleu.</p>
             </div>

             <div *ngSwitchCase="'PENDING'" class="text-amber-500 mb-4">
                 <div class="text-5xl mb-2">⏳</div>
                 <h2 class="text-2xl font-bold">En cours...</h2>
                 <p class="text-slate-600 mt-2">Votre demande est en cours d'analyse par nos équipes.</p>
             </div>

             <div *ngSwitchCase="'REJECTED'" class="text-red-500 mb-4">
                  <div class="text-5xl mb-2">❌</div>
                  <h2 class="text-2xl font-bold">Refusé</h2>
                  <p class="text-slate-600 mt-2">Votre photo ne correspondait pas aux critères. Réessayez.</p>
             </div>

             <div *ngSwitchDefault>
                 <div class="text-5xl mb-4">📸</div>
                 <h2 class="text-xl font-bold mb-2">Prouvez que c'est vous</h2>
                 <p class="text-slate-600 mb-6 text-sm">
                    Pour obtenir le badge vérifié, prenez un selfie en faisant ce geste :
                 </p>
                 
                 <!-- The Pose Instruction -->
                 <div class="bg-slate-100 rounded-xl p-4 mb-6">
                     <span class="text-4xl">✌️</span>
                     <p class="font-bold mt-2">Signe de paix (V)</p>
                 </div>

                 <!-- Upload Area -->
                 <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*" capture="user">
                 
                 <div *ngIf="previewUrl()" class="relative mb-6 rounded-xl overflow-hidden shadow-md aspect-[3/4] max-w-[200px] mx-auto">
                     <img [src]="previewUrl()" class="w-full h-full object-cover">
                     <button (click)="clearFile()" class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 w-8 h-8">×</button>
                 </div>

                 <button 
                    *ngIf="!previewUrl()"
                    (click)="fileInput.click()"
                    class="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all mb-3">
                    Prendre une photo
                 </button>

                 <button 
                    *ngIf="previewUrl()"
                    (click)="submit()"
                    [disabled]="isLoading()"
                    class="w-full py-3 bg-sage text-white rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {{ isLoading() ? 'Envoi...' : 'Envoyer la demande' }}
                 </button>
             </div>
         </ng-container>

      </div>
    </div>
  `
})
export class VerificationComponent {
  profileService = inject(ProfileService);
  router = inject(Router);

  status = computed(() => this.profileService.currentUser()?.verificationStatus || 'NONE');
  previewUrl = signal<string | null>(null);
  selectedFile: File | null = null;
  isLoading = signal(false);

  goBack() {
      this.router.navigate(['/profile']);
  }

  onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          this.selectedFile = file;
          const reader = new FileReader();
          reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
          reader.readAsDataURL(file);
      }
  }

  clearFile() {
      this.selectedFile = null;
      this.previewUrl.set(null);
  }

  submit() {
      if (!this.selectedFile) return;
      
      this.isLoading.set(true);
      this.profileService.requestVerification(this.selectedFile).subscribe({
          next: () => {
              this.isLoading.set(false);
              // Optimistic update logic if needed, but service usually refreshes profile or we rely on re-fetch
              // Let's force update local state for immediate feedback
              const current = this.profileService.currentUser();
              // Update status in service manually? Better to reload profile.
              this.profileService.loadProfile(); 
          },
          error: (err) => {
              console.error(err);
              this.isLoading.set(false);
              alert("Erreur lors de l'envoi.");
          }
      });
  }
}
