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
  imports: [CommonModule, ReactiveFormsModule, SlInputComponent],
  template: `
    <div class="min-h-screen bg-ivory dark:bg-night pb-24 transition-colors duration-500">
      <!-- Header / Cover -->
      <div class="h-48 bg-gradient-to-br from-night to-slate-800 relative overflow-hidden">
         <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
         
         <button (click)="goHome()" class="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all z-10 group" title="Retour Accueil">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
         </button>

         <div class="absolute top-6 left-1/2 -translate-x-1/2 z-10 opacity-60">
            <div class="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shadow-lg shadow-sage/20 text-white font-black text-sm">s</div>
         </div>

         <button (click)="goToSettings()" class="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all z-10" title="Paramètres">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
         </button>

         <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div class="relative group cursor-pointer p-1 bg-ivory dark:bg-night rounded-3xl">
               <div class="w-32 h-32 rounded-[2rem] border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-100 shadow-2xl relative">
                  <img *ngIf="user().avatarUrl; else noPhoto" [src]="user().avatarUrl" loading="lazy" [alt]="user().username" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                  <ng-template #noPhoto>
                     <div class="w-full h-full flex items-center justify-center bg-slate-200 text-4xl">👤</div>
                  </ng-template>
                  
                  <!-- Edit Overlay -->
                  <div class="absolute inset-0 bg-night/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span class="text-white text-[10px] font-black uppercase tracking-widest">Modifier</span>
                  </div>
               </div>
               <input type="file" class="absolute inset-0 opacity-0 cursor-pointer z-20" (change)="onPhotoSelected($event)">
            </div>
         </div>
      </div>

       <!-- Profile Information -->
       <div class="mt-16 px-6 text-center">
          <h1 class="text-3xl font-black text-night dark:text-white flex items-center justify-center gap-2 tracking-tighter">
            {{ user().username }}
            <span *ngIf="user().isVerified" class="relative flex h-5 w-5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="relative h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </span>
            <span *ngIf="user().isPremium" class="text-amber-500" title="Premium">👑</span>
          </h1>
          <p class="text-slate-400 dark:text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">{{ user().occupation || 'Profession mystérieuse' }}</p>
          
          <div *ngIf="!user().isVerified" class="mt-4">
             <button 
               (click)="goToVerification()" 
               class="px-5 py-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-sage hover:text-sage transition-all duration-300">
               {{ user().verificationStatus === 'PENDING' ? '⏳ Vérification en attente' : '🛡️ Certifier mon compte' }}
             </button>
          </div>
       </div>

      <!-- Main Content Area -->
      <div class="px-6 mt-10 max-w-2xl mx-auto space-y-6">
        
        <!-- View Mode -->
        <ng-container *ngIf="!isEditing()">
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-bl-full pointer-events-none group-hover:bg-sage/10 transition-colors duration-500"></div>
              
              <div class="flex justify-between items-center mb-6 relative">
                 <h3 class="text-xl font-black text-sage tracking-tight">Biographie</h3>
                 <button (click)="toggleEdit()" class="text-xs font-black uppercase tracking-widest text-sage hover:underline underline-offset-4">Éditer</button>
              </div>
              
              <p class="text-night dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium relative">
                 {{ user().bio || "Je n'ai pas encore écrit de bio, mais elle sera incroyable !" }}
              </p>
              
              <!-- Divider -->
              <div class="h-px bg-slate-50 dark:bg-slate-800 my-8"></div>

              <div>
                 <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Centres d'intérêt</h4>
                 <div class="flex flex-wrap gap-2">
                    <span *ngFor="let interest of user().interests" class="px-4 py-1.5 bg-sage/5 dark:bg-slate-800 text-sage dark:text-sage font-black text-[10px] uppercase tracking-wider rounded-xl border border-sage/10">
                       {{ interest }}
                    </span>
                    <p *ngIf="user().interests.length === 0" class="text-slate-400 text-xs italic">Ajoutez des intérêts pour faire briller votre profil.</p>
                 </div>
              </div>

              <!-- More details Grid -->
              <div class="grid grid-cols-2 gap-6 mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                 <div class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Localisation</span>
                    <span class="text-xs font-bold text-night dark:text-white flex items-center gap-1.5 italic">📍 {{ user().location }}</span>
                 </div>
                 <div *ngIf="user().height" class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Taille</span>
                    <span class="text-xs font-bold text-night dark:text-white italic">📏 {{ user().height }} cm</span>
                 </div>
                 <div *ngIf="user().religion" class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Religion</span>
                    <span class="text-xs font-bold text-night dark:text-white italic">🕌 {{ user().religion }}</span>
                 </div>
                 <div *ngIf="user().children" class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Famille</span>
                    <span class="text-xs font-bold text-night dark:text-white italic">👶 {{ user().children }}</span>
                 </div>
              </div>
           </div>
           
           <!-- Premium Banner (Hidden for Universal Premium) -->
           <div *ngIf="false && !user().isPremium" class="relative group overflow-hidden bg-gradient-to-br from-amber-400 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-amber-500/20 transform hover:scale-[1.02] transition-all duration-500 cursor-pointer" (click)="goToPremium()">
              <div class="absolute top-0 right-0 p-4 opacity-30 drop-shadow-xl text-6xl">✨</div>
              <h3 class="text-2xl font-black mb-2 tracking-tighter">Accès Elite</h3>
              <p class="text-white/80 font-bold text-xs mb-6 max-w-[200px] leading-relaxed">
                 Découvrez vos admirateurs secrets et envoyez des messages illimités.
              </p>
              <div class="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                 Découvrir le premium
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                 </svg>
              </div>
           </div>
        </ng-container>

        <!-- Edit Mode -->
        <form *ngIf="isEditing()" [formGroup]="form" (ngSubmit)="save()" class="animate-in fade-in slide-in-from-bottom-5 duration-500 pb-12">
           <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
              <div class="flex justify-between items-center mb-4">
                 <h3 class="text-2xl font-black text-night dark:text-white tracking-tighter">Mon Univers</h3>
                 <button type="button" (click)="toggleEdit()" class="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors">Abandonner</button>
              </div>

              <!-- Base Info -->
              <div class="space-y-6">
                 <div class="flex items-center gap-3">
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">L'essentiel</span>
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                 </div>
                 
                 <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Bio</label>
                    <textarea 
                       formControlName="bio"
                       rows="4"
                       class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-sage rounded-2xl outline-none text-night dark:text-white text-sm font-medium transition-all duration-300"
                       placeholder="Racontez votre histoire..."></textarea>
                 </div>
                 
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <sl-input label="Lieu" [formControl]="form.controls.location"></sl-input>
                    <sl-input label="Genre" [formControl]="form.controls.gender"></sl-input>
                 </div>
              </div>

              <!-- Lifestyle -->
              <div class="space-y-6">
                 <div class="flex items-center gap-3">
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Lifestyle</span>
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <sl-input label="Taille (cm)" [formControl]="form.controls.height" type="number"></sl-input>
                    <sl-input label="Religion" [formControl]="form.controls.religion"></sl-input>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <sl-input label="Métier" [formControl]="form.controls.occupation"></sl-input>
                    <sl-input label="Entreprise" [formControl]="form.controls.company"></sl-input>
                 </div>
              </div>

              <!-- Interests -->
              <div class="space-y-6">
                  <div class="flex items-center gap-3">
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Passions</span>
                    <div class="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                 </div>
                 
                 <div *ngIf="availableInterests() as categories" class="space-y-8">
                     <div *ngFor="let category of objectKeys(categories)">
                         <h5 class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <span class="w-1 h-4 bg-sage rounded-full"></span>
                           {{ category }}
                         </h5>
                         <div class="flex flex-wrap gap-2">
                             <button *ngFor="let interest of categories[category]" 
                                     type="button"
                                     (click)="toggleInterest(interest.name)"
                                     [class.selected-interest]="isSelected(interest.name)"
                                     class="interest-pill">
                                 <span class="mr-1">{{ interest.icon }}</span>
                                 {{ interest.name }}
                             </button>
                         </div>
                     </div>
                 </div>
              </div>

              <div class="pt-6">
                 <button 
                   type="submit" 
                   [disabled]="form.invalid"
                   class="w-full py-5 bg-night dark:bg-sage text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale">
                   Enregistrer l'univers
                 </button>
              </div>
           </div>
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
        this.profileService.updateProfile({ avatarUrl: result });
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

  goToVerification() {
      this.router.navigate(['/profile/verification']);
  }
}
