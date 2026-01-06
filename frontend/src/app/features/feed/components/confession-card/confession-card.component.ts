import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlCardComponent } from '../../../../shared/ui/sl-card/sl-card';
import { Confession } from '../../../../core/models/confession.model';
import { ModerationService } from '../../../../core/services/moderation.service';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TimeService } from '../../../../core/services/time.service';
import { MatchingService } from '../../../matching/services/matching.service';

@Component({
  selector: 'app-confession-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-sage/5 hover:border-sage/20 transition-all duration-500 overflow-hidden relative">
      <!-- Glow Effect on hover -->
      <div class="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div class="p-5 relative">
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center overflow-hidden shadow-inner dark:bg-slate-800 transition-transform group-hover:rotate-6 duration-300">
               <img *ngIf="confession.authorAvatar" [src]="confession.authorAvatar" class="w-full h-full object-cover">
               <span *ngIf="!confession.authorAvatar" class="text-xl">🕵️</span>
            </div>
            <div>
              <span class="font-bold text-night dark:text-white block text-sm tracking-tight">
                {{ confession.authorAlias || 'Anonyme' }}
                <span *ngIf="confession.isMatched" class="ml-1 text-[10px] bg-sage/10 text-sage px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Connecté</span>
              </span>
              <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <span class="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800">{{ confession.location }}</span>
                <span>•</span>
                <span>{{ confession.createdAt | date:'short' }}</span>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <button (click)="toggleMenu()" class="text-slate-300 hover:text-night dark:hover:text-white p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div *ngIf="isMenuOpen()" class="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
               <ng-container *ngIf="isOwner()">
                 <button 
                   *ngIf="canEdit()"
                   (click)="startEdit()"
                   class="w-full text-left px-4 py-2.5 text-xs font-bold text-sage hover:bg-sage/5 flex items-center gap-3 transition-colors">
                   <span>✏️</span> Modifier
                 </button>
                 <button 
                   (click)="onDelete()"
                   class="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors">
                   <span>🗑️</span> Supprimer
                 </button>
               </ng-container>

               <button 
                 (click)="report()"
                 class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                 <span>⚠️</span> Signaler
               </button>
            </div>
            <div *ngIf="isMenuOpen()" (click)="toggleMenu()" class="fixed inset-0 z-0"></div>
         </div>
        </div>

        <!-- Content -->
        <div class="relative mb-5">
          <p *ngIf="!isEditing()" class="text-night dark:text-slate-100 text-[15px] leading-[1.6] tracking-tight whitespace-pre-wrap font-medium">
            {{ confession.content }}
          </p>

          <div *ngIf="isEditing()" class="animate-in fade-in duration-300">
            <textarea 
              [ngModel]="editedContent()" 
              (ngModelChange)="editedContent.set($event)"
              rows="3"
              class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-sage/30 rounded-2xl focus:border-sage outline-none text-night dark:text-white text-sm transition-all duration-300 placeholder:text-slate-400"
              placeholder="Modifiez votre confession..."
            ></textarea>
            <div class="flex justify-end gap-3 mt-3">
              <button (click)="cancelEdit()" class="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
              <button (click)="saveEdit()" [disabled]="!editedContent().trim() || editedContent() === confession.content" 
                      class="bg-sage text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-sage/20 disabled:opacity-30 disabled:shadow-none transform active:scale-95 transition-all">
                Mettre à jour
              </button>
            </div>
          </div>
        </div>

        <!-- Media -->
        <div *ngIf="!isEditing() && confession.imageUrl" class="mb-5 -mx-5 group/img relative overflow-hidden">
          <div class="absolute inset-0 bg-night/5 group-hover/img:bg-transparent transition-colors duration-500 pointer-events-none"></div>
          <img loading="lazy" 
            [alt]="'Media content'" 
            [src]="confession.imageUrl" 
            class="w-full h-auto object-contain max-h-[500px] bg-slate-50 dark:bg-slate-800 group-hover/img:scale-[1.02] transition-transform duration-700">
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <div class="flex items-center gap-1">
            <button 
              (click)="onLike()" 
              class="group/like relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300"
              [ngClass]="confession.isLiked ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50'"
            >
              <span class="text-xl transform group-active/like:scale-150 duration-200">
                {{ confession.isLiked ? '❤️' : '🤍' }}
              </span>
            </button>
            <!-- Like Count -->
             <span class="text-xs font-black text-slate-500 ml-1">{{ confession.likes }}</span>
            
            <button (click)="toggleComments()" class="ml-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-sage hover:bg-sage/5 transition-all duration-300">
              <span class="text-lg">💬</span>
              <span class="text-xs font-black">{{ confession.commentsCount }}</span>
            </button>
          </div>
          
          <div *ngIf="!isOwner() && !confession.isMatched" class="flex items-center">
             <button 
               (click)="requestConnection()" 
               [disabled]="isRequested()"
               class="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95"
               [ngClass]="isRequested() ? 'bg-slate-100 text-slate-400' : 'bg-sage/10 text-sage hover:bg-sage hover:text-white shadow-lg shadow-sage/10'"
             >
               {{ isRequested() ? 'Demande envoyée' : 'Se connecter' }}
             </button>
          </div>

          <div *ngIf="isOwner() && canEdit()" class="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 animate-pulse">
            {{ editTimeRemaining() }}s left
          </div>
        </div>

        <!-- Comments Section -->
        <div *ngIf="showComments()" class="mt-5 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
           <div *ngIf="isLoadingComments()" class="flex justify-center py-4">
              <div class="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin"></div>
           </div>
           
           <div *ngFor="let comment of comments()" class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-slate-800/50">
              <span class="font-black text-slate-900 dark:text-white mr-2">@{{ comment.authorAlias }}</span> 
              {{ comment.content }}
           </div>
           
           <div class="flex items-center gap-2 mt-4 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 pr-4 border border-slate-100 dark:border-slate-700/50">
              <input 
                type="text" 
                [ngModel]="newCommentContent()" 
                (ngModelChange)="newCommentContent.set($event)"
                (keyup.enter)="submitComment()"
                placeholder="Écrire un mot doux..." 
                class="flex-grow bg-transparent border-none px-3 py-2 text-xs font-medium focus:outline-none dark:text-white placeholder:text-slate-400"
              >
              <button 
                (click)="submitComment()"
                [disabled]="!newCommentContent().trim()"
                class="w-8 h-8 flex items-center justify-center bg-sage text-white rounded-xl shadow-lg shadow-sage/20 disabled:opacity-0 transition-all transform active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ConfessionCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) confession!: Confession;
  @Output() like = new EventEmitter<string>();

  moderationService = inject(ModerationService);
  feedService = inject(FeedService);
  authService = inject(AuthService);
  matchingService = inject(MatchingService);
  toastService = inject(ToastService);
  timeService = inject(TimeService);
  
  isRequested = signal(false);
  
  isMenuOpen = signal(false);
  showComments = signal(false);
  
  comments = signal<any[]>([]);
  isLoadingComments = signal(false);
  newCommentContent = signal('');

  // Edit / Delete Logic
  isEditing = signal(false);
  editedContent = signal('');

  isOwner = computed(() => {
    const user = this.authService.currentUser();
    return !!(user && this.confession.authorId && user.id === this.confession.authorId);
  });

  canEdit = computed(() => {
    if (!this.confession.createdAt) return false;
    const createdAt = new Date(this.confession.createdAt).getTime();
    const now = this.timeService.now().getTime();
    const diff = now - createdAt;
    return diff < 2 * 60 * 1000;
  });

  editTimeRemaining = computed(() => {
    const createdAt = new Date(this.confession.createdAt).getTime();
    const now = this.timeService.now().getTime();
    const remaining = Math.max(0, Math.floor((120000 - (now - createdAt)) / 1000));
    return remaining;
  });

  ngOnInit() {
    // Shared timer logic via TimeService
  }

  ngOnDestroy() {
    // No local timer to clean up
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
    this.toastService.success('Le contenu a été signalé. Merci !');
  }

  // Action methods
  onDelete() {
    if (confirm('Voulez-vous vraiment supprimer cette confession ?')) {
      this.feedService.deleteConfession(this.confession.id).subscribe({
        next: () => this.toastService.success('Confession supprimée.'),
        error: (err: any) => this.toastService.error(err.error?.message || 'Erreur lors de la suppression')
      });
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
        this.toastService.success('Modifications enregistrées.');
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la modification');
        this.isEditing.set(false);
      }
    });
  }

  requestConnection() {
    this.matchingService.requestConfessionMatch(this.confession.id).subscribe({
      next: () => this.isRequested.set(true)
    });
  }
}
