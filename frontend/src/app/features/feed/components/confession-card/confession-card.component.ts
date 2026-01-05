import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { Confession } from '../../../../core/models/confession.model';
import { ModerationService } from '../../../../core/services/moderation.service';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-confession-card',
  standalone: true,
  imports: [CommonModule, SlCardComponent, FormsModule],
  template: `
    <sl-card class="mb-4 hover:border-sage/30 transition-colors relative">
      <!-- Header -->
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg mr-2">
            🕵️
          </div>
          <div>
            <span class="font-bold text-slate-700 block text-sm">{{ confession.authorAlias || 'Anonyme' }}</span>
            <span class="text-xs text-slate-400">{{ confession.location }} • {{ confession.createdAt | date:'short' }}</span>
          </div>
        </div>
        
        <div class="relative">
          <button (click)="toggleMenu()" class="text-slate-300 hover:text-night p-1 rounded-full hover:bg-slate-100 transition-colors">
            <span class="sr-only">Options</span>
            •••
          </button>
          
          <!-- Dropdown Menu -->
          <div *ngIf="isMenuOpen()" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
             <!-- Actions Propriétaire -->
             <ng-container *ngIf="isOwner()">
               <button 
                 *ngIf="canEdit()"
                 (click)="startEdit()"
                 class="w-full text-left px-4 py-2 text-sm text-sage hover:bg-sage/5 flex items-center gap-2 border-b border-slate-50">
                 <span>✏️</span> Modifier
               </button>
               <button 
                 (click)="onDelete()"
                 class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-slate-50">
                 <span>🗑️</span> Supprimer
               </button>
             </ng-container>

             <button 
               (click)="report()"
               class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <span>⚠️</span> Signaler
             </button>
             <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
               <span>🔗</span> Copier le lien
             </button>
          </div>
          <!-- Backdrop for menu -->
          <div *ngIf="isMenuOpen()" (click)="toggleMenu()" class="fixed inset-0 z-0"></div>
       </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isEditing(); else editMode">
        <p class="text-night text-lg leading-relaxed mb-4 whitespace-pre-wrap">{{ confession.content }}</p>
      </div>
      
      <ng-template #editMode>
        <div class="mb-4">
          <textarea 
            [(ngModel)]="editedContent" 
            rows="3"
            class="w-full p-2 border border-sage rounded-lg focus:ring-2 focus:ring-sage/20 outline-none text-night"
            placeholder="Modifiez votre confession..."
          ></textarea>
          <div class="flex justify-end gap-2 mt-2">
            <button (click)="cancelEdit()" class="text-xs text-slate-400 hover:text-slate-600">Annuler</button>
            <button (click)="saveEdit()" [disabled]="!editedContent().trim() || editedContent() === confession.content" 
                    class="bg-sage text-white px-3 py-1 rounded-full text-xs font-bold disabled:opacity-50">
              Enregistrer
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-50">
        <div class="flex space-x-6">
          <button 
            (click)="onLike()" 
            class="flex items-center space-x-1.5 transition-colors group"
            [ngClass]="confession.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'"
          >
            <span class="text-xl group-active:scale-125 transition-transform">
              {{ confession.isLiked ? '❤️' : '🤍' }}
            </span>
            <span class="font-medium text-sm">{{ confession.likes }}</span>
          </button>
          
          <button (click)="toggleComments()" class="flex items-center space-x-1.5 text-slate-500 hover:text-sage transition-colors">
            <span class="text-xl">💬</span>
            <span class="font-medium text-sm">{{ confession.commentsCount }}</span>
          </button>
        </div>
        
        <div *ngIf="isOwner() && canEdit()" class="text-[10px] text-slate-300 italic">
          Modifiable pendant encore {{ editTimeRemaining() }}s
        </div>
      </div>
      
      <!-- Report Success Toast Mock (Inline for MVP) -->
      <div *ngIf="showReportToast()" class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-night text-white text-xs px-3 py-1 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
         Signalement envoyé !
      </div>

      <!-- Comments Section -->
      <div *ngIf="showComments()" class="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
         <div *ngIf="isLoadingComments()" class="text-center py-2 text-slate-400 text-xs">Chargement...</div>
         
         <div *ngFor="let comment of comments()" class="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-2">
            <strong>{{ comment.authorAlias }}:</strong> {{ comment.content }}
         </div>
         
         <div *ngIf="!isLoadingComments() && comments().length === 0" class="text-center py-2 text-slate-400 text-xs">Aucun commentaire pour le moment.</div>
         
         <div class="flex gap-2 mt-3">
            <input 
              type="text" 
              [(ngModel)]="newCommentContent" 
              (keyup.enter)="submitComment()"
              placeholder="Ajouter un commentaire..." 
              class="flex-grow bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sage"
            >
            <button 
              (click)="submitComment()"
              [disabled]="!newCommentContent().trim()"
              class="text-sage font-medium text-sm hover:underline disabled:opacity-50"
            >
              Envoyer
            </button>
         </div>
      </div>
    </sl-card>
  `
})
export class ConfessionCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) confession!: Confession;
  @Output() like = new EventEmitter<string>();

  moderationService = inject(ModerationService);
  feedService = inject(FeedService);
  authService = inject(AuthService);
  
  isMenuOpen = signal(false);
  showReportToast = signal(false);
  showComments = signal(false);
  
  comments = signal<any[]>([]);
  isLoadingComments = signal(false);
  newCommentContent = signal('');

  // Edit / Delete Logic
  isEditing = signal(false);
  editedContent = signal('');
  currentTime = signal(new Date());
  private timer: any;

  isOwner = computed(() => {
    const user = this.authService.currentUser();
    return user?.id === this.confession.authorId;
  });

  canEdit = computed(() => {
    const createdAt = new Date(this.confession.createdAt).getTime();
    const now = this.currentTime().getTime();
    const diff = now - createdAt;
    return diff < 2 * 60 * 1000; // 2 minutes
  });

  editTimeRemaining = computed(() => {
    const createdAt = new Date(this.confession.createdAt).getTime();
    const now = this.currentTime().getTime();
    const remaining = Math.max(0, Math.floor((120000 - (now - createdAt)) / 1000));
    return remaining;
  });

  ngOnInit() {
    // Update timer every second to refresh "canEdit" and "editTimeRemaining"
    this.timer = setInterval(() => {
      this.currentTime.set(new Date());
      if (!this.canEdit() && this.isEditing()) {
        this.cancelEdit();
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  toggleComments() {
    this.showComments.update(v => !v);
    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }

  loadComments() {
    this.isLoadingComments.set(true);
    this.feedService.getComments(this.confession.id).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoadingComments.set(false);
      },
      error: () => this.isLoadingComments.set(false)
    });
  }

  submitComment() {
    const content = this.newCommentContent().trim();
    if (!content) return;

    this.feedService.addComment(this.confession.id, content).subscribe({
      next: (res: any) => {
        this.comments.update(list => [...list, res.comment]);
        this.newCommentContent.set('');
        this.confession.commentsCount++;
      }
    });
  }

  onLike() {
    this.like.emit(this.confession.id);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  report() {
    this.moderationService.reportContent(this.confession.id, 'confession', 'Contenu inapproprié');
    this.isMenuOpen.set(false);
    this.showReportToast.set(true);
    setTimeout(() => this.showReportToast.set(false), 3000);
  }

  // Action methods
  onDelete() {
    if (confirm('Voulez-vous vraiment supprimer cette confession ?')) {
      this.feedService.deleteConfession(this.confession.id).subscribe();
    }
    this.isMenuOpen.set(false);
  }

  startEdit() {
    this.isEditing.set(true);
    this.editedContent.set(this.confession.content);
    this.isMenuOpen.set(false);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    const newContent = this.editedContent().trim();
    if (!newContent || newContent === this.confession.content) {
      this.isEditing.set(false);
      return;
    }

    this.feedService.updateConfession(this.confession.id, newContent).subscribe({
      next: () => {
        this.confession.content = newContent;
        this.isEditing.set(false);
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de la modification');
        this.isEditing.set(false);
      }
    });
  }
}
