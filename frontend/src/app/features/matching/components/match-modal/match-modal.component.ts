import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';

@Component({
  selector: 'app-match-modal',
  standalone: true,
  imports: [CommonModule, SlButtonComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-night/90 backdrop-blur-sm animate-in fade-in duration-300">
       <div class="w-full max-w-md bg-transparent text-center p-6 relative">
          <!-- Animation decorations -->
          <div class="text-6xl mb-4 animate-bounce">💖</div>
          
          <h2 class="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md italic">C'est un Match !</h2>
          <p class="text-white/80 mb-8 max-w-xs mx-auto">Vous et {{ matchedUser?.username }} vous êtes plu.</p>

          <div class="flex justify-center items-center gap-4 mb-10">
             <!-- Me -->
             <div class="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden shadow-2xl">
                 <div class="w-full h-full bg-sage items-center justify-center flex text-2xl text-white">Moi</div>
             </div>
             <!-- Other -->
             <div class="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden shadow-2xl">
                 <div *ngIf="matchedUser?.profilePhotoUrl; else noPhoto" class="w-full h-full">
                   <img [src]="matchedUser!.profilePhotoUrl" class="w-full h-full object-cover">
                 </div>
                 <ng-template #noPhoto>
                    <div class="w-full h-full bg-amber items-center justify-center flex text-2xl text-white font-bold">
                       {{ matchedUser?.username?.charAt(0) }}
                    </div>
                 </ng-template>
             </div>
          </div>

          <div class="space-y-3">
             <sl-button variant="primary" size="lg" [block]="true" (click)="message.emit()">
                Envoyer un message
             </sl-button>
             <sl-button variant="ghost" [block]="true" class="text-white hover:bg-white/10" (click)="close()">
                Continuer à chercher
             </sl-button>
          </div>
       </div>
    </div>
  `
})
export class MatchModalComponent {
  @Input() isOpen = false;
  @Input() matchedUser: User | null = null;
  
  @Output() closeMatch = new EventEmitter<void>();
  @Output() message = new EventEmitter<void>();

  close() {
    this.closeMatch.emit();
  }
}
