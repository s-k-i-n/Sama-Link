import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { SlInputComponent } from '../../../../shared/ui/sl-input/sl-input';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlButtonComponent, SlInputComponent, SlCardComponent],
  template: `
    <div class="min-h-screen bg-ivory pb-20">
      <!-- Header / Cover -->
      <div class="h-40 bg-night relative">
         <button (click)="goToSettings()" class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10" title="Paramètres">
            <span class="text-xl">⚙️</span>
         </button>
         <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div class="relative group cursor-pointer">
               <div class="w-32 h-32 rounded-full border-4 border-ivory overflow-hidden bg-white shadow-lg">
                  <img *ngIf="user().profilePhotoUrl; else noPhoto" [src]="user().profilePhotoUrl" class="w-full h-full object-cover">
                  <ng-template #noPhoto>
                     <div class="w-full h-full flex items-center justify-center bg-slate-200 text-4xl">👤</div>
                  </ng-template>
               </div>
               <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-white text-sm">📷 Modifier</span>
               </div>
               <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onPhotoSelected($event)">
            </div>
         </div>
      </div>

      <!-- Main Info -->
      <div class="mt-20 px-4 text-center">
         <h1 class="text-2xl font-bold text-night flex items-center justify-center gap-2">
           {{ user().username }}
           <span *ngIf="user().isPremium" class="text-amber text-lg" title="Premium">👑</span>
         </h1>
         <p class="text-slate-500">{{ user().occupation || 'Métier non renseigné' }}</p>
      </div>

      <!-- Content -->
      <div class="px-4 mt-8 max-w-lg mx-auto space-y-6">
        
        <!-- View Mode -->
        <ng-container *ngIf="!isEditing()">
           <sl-card>
              <div class="flex justify-between items-start mb-4">
                 <h3 class="font-bold text-lg text-sage">À propos</h3>
                 <button (click)="toggleEdit()" class="text-sage text-sm font-medium hover:underline">Modifier</button>
              </div>
              <p class="text-slate-700 whitespace-pre-wrap">{{ user().bio }}</p>
              
              <div class="mt-6">
                 <h4 class="font-bold text-sm text-slate-500 mb-2 uppercase tracking-wide">Intérêts</h4>
                 <div class="flex flex-wrap gap-2">
                    <span *ngFor="let interest of user().interests" class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                       {{ interest }}
                    </span>
                 </div>
              </div>

              <div class="mt-6 flex flex-col gap-2 text-sm text-slate-600">
                 <div class="flex items-center gap-2">
                    <span>📍</span> {{ user().location }}
                 </div>
                 <div class="flex items-center gap-2">
                    <span>🎓</span> {{ user().education || 'Non renseigné' }}
                 </div>
              </div>
           </sl-card>
           
           <div *ngIf="!user().isPremium" class="bg-gradient-to-r from-amber to-orange-400 p-6 rounded-2xl text-white shadow-lg text-center">
              <h3 class="font-bold text-xl mb-2">Passez Premium ! 🚀</h3>
              <p class="text-white/90 mb-4 text-sm">Débloquez les messages illimités et voyez qui vous like.</p>
              <sl-button variant="secondary" [block]="true" class="bg-white text-amber hover:bg-slate-50 border-none" (click)="goToPremium()">
                 Voir les offres
              </sl-button>
           </div>
        </ng-container>

        <!-- Edit Mode -->
        <form *ngIf="isEditing()" [formGroup]="form" (ngSubmit)="save()">
           <sl-card>
              <div class="flex justify-between items-center mb-6">
                 <h3 class="font-bold text-lg text-night">Édition du profil</h3>
                 <button type="button" (click)="toggleEdit()" class="text-slate-400 hover:text-red-500">Annuler</button>
              </div>

              <div class="space-y-4">
                 <sl-input label="Bio" [formControl]="form.controls.bio" type="textarea"></sl-input>
                 <sl-input label="Métier" [formControl]="form.controls.occupation"></sl-input>
                 <sl-input label="Études" [formControl]="form.controls.education"></sl-input>
                 <sl-input label="Localisation" [formControl]="form.controls.location"></sl-input>
              </div>

              <div class="mt-6">
                 <sl-button type="submit" variant="primary" [block]="true" [disabled]="form.invalid">Enregistrer</sl-button>
              </div>
           </sl-card>
        </form>

      </div>
    </div>
  `
})
export class ProfileComponent {
  profileService = inject(ProfileService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  
  user = this.profileService.currentUser;
  isEditing = signal(false);

  form = this.fb.group({
    bio: ['', [Validators.required, Validators.maxLength(500)]],
    occupation: [''],
    education: [''],
    location: ['', Validators.required]
  });

  toggleEdit() {
    if (!this.isEditing()) {
      // Initialize form with current data
      const u = this.user();
      this.form.patchValue({
        bio: u.bio,
        occupation: u.occupation,
        education: u.education,
        location: u.location
      });
    }
    this.isEditing.update(v => !v);
  }

  save() {
    if (this.form.valid) {
      this.profileService.updateProfile(this.form.value as any);
      this.isEditing.set(false);
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Create local preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileService.updatePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  }

  goToPremium() {
    this.router.navigate(['/premium']);
  }

  goToSettings() {
    this.router.navigate(['/profile/settings']);
  }
}
