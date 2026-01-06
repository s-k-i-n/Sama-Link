import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, Interest } from '../../services/profile.service';
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
         <button (click)="goHome()" class="absolute top-4 left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10" title="Retour Accueil">
            <span class="text-xl">🏠</span>
         </button>
         <button (click)="goToSettings()" class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10" title="Paramètres">
            <span class="text-xl">⚙️</span>
         </button>
         <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div class="relative group cursor-pointer">
               <div class="w-32 h-32 rounded-full border-4 border-ivory overflow-hidden bg-white shadow-lg">
                  <img *ngIf="user().profilePhotoUrl; else noPhoto" [src]="user().profilePhotoUrl" loading="lazy" [alt]="'Photo de profil de ' + user().username" class="w-full h-full object-cover">
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
                    <span *ngIf="user().interests.length === 0" class="text-slate-400 italic text-sm">Aucun intérêt ajouté.</span>
                 </div>
              </div>

              <div class="mt-6 flex flex-col gap-2 text-sm text-slate-600">
                 <div class="flex items-center gap-2">
                    <span class="w-6 text-center">📍</span> {{ user().location }}
                 </div>
                 <div *ngIf="user().height" class="flex items-center gap-2">
                    <span class="w-6 text-center">📏</span> {{ user().height }} cm
                 </div>
                 <div *ngIf="user().occupation" class="flex items-center gap-2">
                    <span class="w-6 text-center">💼</span> {{ user().occupation }} <span *ngIf="user().company">chez {{ user().company }}</span>
                 </div>
                 <div *ngIf="user().school || user().educationLevel" class="flex items-center gap-2">
                    <span class="w-6 text-center">🎓</span> {{ user().educationLevel }} <span *ngIf="user().school">à {{ user().school }}</span>
                 </div>
                 <div *ngIf="user().religion" class="flex items-center gap-2">
                    <span class="w-6 text-center">🕌</span> {{ user().religion }}
                 </div>
                 <div *ngIf="user().children" class="flex items-center gap-2">
                    <span class="w-6 text-center">👶</span> {{ user().children }}
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

              <div class="space-y-8">
                 <!-- Bio & Basics -->
                 <div class="space-y-4">
                    <h4 class="font-bold text-sm text-slate-400 uppercase tracking-widest border-b pb-2">Base</h4>
                    <sl-input label="Bio" [formControl]="form.controls.bio" type="textarea"></sl-input>
                    <sl-input label="Localisation" [formControl]="form.controls.location"></sl-input>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <sl-input label="Taille (cm)" [formControl]="form.controls.height" type="number"></sl-input>
                      <sl-input label="Genre" [formControl]="form.controls.gender"></sl-input>
                    </div>
                 </div>

                 <!-- Work & Education -->
                 <div class="space-y-4">
                    <h4 class="font-bold text-sm text-slate-400 uppercase tracking-widest border-b pb-2">Travail & Études</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <sl-input label="Métier" [formControl]="form.controls.occupation"></sl-input>
                      <sl-input label="Entreprise" [formControl]="form.controls.company"></sl-input>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                       <sl-input label="École" [formControl]="form.controls.school"></sl-input>
                       <sl-input label="Niveau d'études" [formControl]="form.controls.education"></sl-input>
                    </div>
                 </div>

                 <!-- Lifestyle -->
                 <div class="space-y-4">
                    <h4 class="font-bold text-sm text-slate-400 uppercase tracking-widest border-b pb-2">Style de vie</h4>
                    <div class="grid grid-cols-2 gap-4">
                       <sl-input label="Religion" [formControl]="form.controls.religion"></sl-input>
                       <sl-input label="Enfants" [formControl]="form.controls.children"></sl-input>
                    </div>
                     <div class="grid grid-cols-2 gap-4">
                       <sl-input label="Alcool" [formControl]="form.controls.drinking"></sl-input>
                       <sl-input label="Tabac" [formControl]="form.controls.smoking"></sl-input>
                    </div>
                 </div>

                 <!-- Interests Selection -->
                 <div class="space-y-4">
                     <h4 class="font-bold text-sm text-slate-400 uppercase tracking-widest border-b pb-2">Intérêts</h4>
                     <p class="text-xs text-slate-500 mb-2">Sélectionnez vos centres d'intérêt pour de meilleurs matchs.</p>
                     
                     <div *ngIf="availableInterests() as categories" class="space-y-4">
                         <div *ngFor="let category of objectKeys(categories)">
                             <h5 class="text-sm font-semibold text-night mb-2">{{ category }}</h5>
                             <div class="flex flex-wrap gap-2">
                                 <button *ngFor="let interest of categories[category]" 
                                         type="button"
                                         (click)="toggleInterest(interest.name)"
                                         [class.bg-mint]="isSelected(interest.name)"
                                         [class.text-white]="isSelected(interest.name)"
                                         [class.bg-slate-100]="!isSelected(interest.name)"
                                         [class.text-slate-600]="!isSelected(interest.name)"
                                         class="px-3 py-1 rounded-full text-sm transition-colors border border-transparent hover:border-mint">
                                     {{ interest.icon }} {{ interest.name }}
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
              </div>

              <div class="mt-8">
                 <sl-button type="submit" variant="primary" [block]="true" [disabled]="form.invalid">Enregistrer</sl-button>
              </div>
           </sl-card>
        </form>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  
  user = this.profileService.currentUser;
  isEditing = signal(false);
  availableInterests = signal<Record<string, Interest[]>>({});
  
  // Track selected interests manually as FormArray is verbose for simple selection
  selectedInterests = signal<string[]>([]);

  form = this.fb.group({
    bio: ['', [Validators.required, Validators.maxLength(500)]],
    occupation: [''],
    company: [''],
    education: [''],
    school: [''],
    location: ['', Validators.required],
    height: [null as number | null],
    religion: [''],
    drinking: [''],
    smoking: [''],
    children: [''],
    gender: ['']
  });

  ngOnInit() {
      this.profileService.loadProfile();
      this.profileService.getInterests().subscribe(interests => {
          this.availableInterests.set(interests);
      });
  }

  objectKeys(obj: any) {
      return Object.keys(obj);
  }

  toggleEdit() {
    if (!this.isEditing()) {
      // Initialize form with current data
      const u = this.user();
      this.form.patchValue({
        bio: u.bio,
        occupation: u.occupation, // mapped to jobTitle in backend, we should align
        company: u.company,
        education: u.educationLevel, // Align naming
        school: u.school,
        location: u.location,
        height: u.height,
        religion: u.religion,
        drinking: u.drinking,
        smoking: u.smoking,
        children: u.children,
        gender: u.gender
      });
      // Initialize selected interests
      this.selectedInterests.set([...(u.interests || [])]);
    }
    this.isEditing.update(v => !v);
  }

  toggleInterest(name: string) {
      this.selectedInterests.update(current => {
          if (current.includes(name)) {
              return current.filter(i => i !== name);
          } else {
              if (current.length >= 10) return current; // Max limit
              return [...current, name];
          }
      });
  }

  isSelected(name: string) {
      return this.selectedInterests().includes(name);
  }

  save() {
    if (this.form.valid) {
      const updates = {
          ...this.form.value,
          interests: this.selectedInterests()
      };
      this.profileService.updateProfile(updates as any);
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
        this.profileService.updateProfile({ profilePhotoUrl: result });
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

  goHome() {
    this.router.navigate(['/feed']);
  }
}
