import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RouterLink } from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';
 
 @Component({
   selector: 'app-settings',
   standalone: true,
   imports: [CommonModule, SlCardComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-ivory">
       <div class="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex items-center gap-3">
         <button routerLink="/profile" class="text-slate-500 hover:text-sage transition-colors p-1 text-xl">←</button>
         <h1 class="text-xl font-bold text-night">Paramètres</h1>
       </div>

       <div class="p-4 space-y-4 max-w-lg mx-auto">
         <sl-card>
            <h3 class="font-bold text-slate-900 mb-4 px-2">Préférences</h3>
            
            <div class="divide-y divide-slate-100">
                <div class="flex items-center justify-between py-3 px-2">
                   <div class="flex flex-col">
                      <span class="text-sm font-medium text-slate-700">Notifications Push</span>
                      <span class="text-xs text-slate-500">Soyez alerté des nouveaux matchs</span>
                   </div>
                   <input type="checkbox" class="toggle toggle-success" [checked]="settings().notifications" (change)="toggleNotif()">
                </div>

                <div class="flex items-center justify-between py-3 px-2">
                   <div class="flex flex-col">
                      <span class="text-sm font-medium text-slate-700">Confidentialité</span>
                      <span class="text-xs text-slate-500">Profil public ou privé</span>
                   </div>
                   <select class="select select-sm select-ghost w-fit" (change)="changePrivacy($event)">
                      <option [selected]="settings().privacy === 'public'" value="public">Public</option>
                      <option [selected]="settings().privacy === 'friends'" value="friends">Amis</option>
                   </select>
                </div>
            </div>
         </sl-card>

         <sl-card>
            <h3 class="font-bold text-slate-900 mb-4 px-2">Application</h3>
            <div class="divide-y divide-slate-100">
                <div class="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-slate-50 transition-colors">
                   <span class="text-sm font-medium text-slate-700">Langue</span>
                   <span class="text-sm text-slate-500">Français 🇫🇷</span>
                </div>
                <div (click)="showSupport()" class="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-slate-50 transition-colors">
                   <span class="text-sm font-medium text-slate-700">Aide & Support</span>
                   <span class="text-lg">›</span>
                </div>
                 <div (click)="logout()" class="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-slate-50 transition-colors">
                   <span class="text-sm font-medium text-red-500">Se déconnecter</span>
                   <span class="text-lg text-red-500">›</span>
                </div>
            </div>
         </sl-card>

         <sl-card>
            <h3 class="font-bold text-slate-900 mb-4 px-2">Confidentialité & Données (GDPR)</h3>
            <div class="divide-y divide-slate-100">
                <div (click)="exportData()" class="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-slate-50 transition-colors">
                   <div class="flex flex-col">
                      <span class="text-sm font-medium text-slate-700">Exporter mes données</span>
                      <span class="text-[10px] text-slate-400">Obtenir une copie de mon profil au format JSON</span>
                   </div>
                   <span class="text-lg text-slate-300">💾</span>
                </div>
                
                <div (click)="confirmDelete()" class="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-red-50 group transition-colors">
                   <div class="flex flex-col">
                      <span class="text-sm font-medium text-red-500">Supprimer mon compte</span>
                      <span class="text-[10px] text-red-400">Action irréversible - Suppression immédiate</span>
                   </div>
                   <span class="text-lg opacity-0 group-hover:opacity-100 transition-opacity">🗑️</span>
                </div>
            </div>
         </sl-card>

         <div class="text-center text-xs text-slate-400 py-4">
            Sama Link v1.0.0 (Beta)
         </div>
       </div>
    </div>
  `
})
export class SettingsComponent {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  
  notificationService = inject(NotificationService);
  
  settings = this.profileService.settings;

  toggleNotif() {
    const newVal = !this.settings().notifications;
    if (newVal) {
      this.notificationService.requestPermissionAndSubscribe();
    } else {
      this.notificationService.unsubscribe();
    }
    this.profileService.updateSettings({ notifications: newVal });
  }

  changePrivacy(event: any) {
    this.profileService.updateSettings({ privacy: event.target.value });
  }

  changeTheme(theme: string) {
    this.profileService.updateSettings({ theme });
  }

  logout() {
    this.authService.logout();
  }

  showSupport() {
    this.toastService.info('Support: Contactez-nous à support@samalink.com');
  }

  exportData() {
    this.profileService.exportData();
  }

  confirmDelete() {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte Sama Link ? Cette action est irréversible.")) {
      this.profileService.deleteAccount().subscribe({
        next: () => this.toastService.success("Compte supprimé."),
        error: () => this.toastService.error("Erreur suppression.")
      });
    }
  }
}
