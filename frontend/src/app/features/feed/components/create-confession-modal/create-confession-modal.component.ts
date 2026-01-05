import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlModalComponent } from '../../../../shared/ui/sl-modal/sl-modal';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { FeedService } from '../../services/feed.service';

@Component({
  selector: 'app-create-confession-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlModalComponent, SlButtonComponent],
  template: `
    <sl-modal 
      [isOpen]="isOpen()" 
      title="Nouvelle Confession" 
      (closed)="close()">
      
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-4">
          <textarea 
            formControlName="content"
            rows="5" 
            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage resize-none"
            placeholder="Confessez-vous en toute liberté... (Anonymat garanti)"
          ></textarea>
          <div class="flex justify-end mt-1">
            <span class="text-xs text-slate-400" [ngClass]="{'text-red-500': charCount() > 500}">
              {{ charCount() }}/500
            </span>
          </div>

          <div class="flex items-center gap-2 mb-2">
             <input type="checkbox" formControlName="isAnonymous" id="anon" class="checkbox checkbox-sm checkbox-success">
             <label for="anon" class="text-sm text-slate-600 cursor-pointer select-none">
               Publier en anonyme 🕵️
             </label>
          </div>
        </div>

        <div class="bg-slate-50 -mx-6 -mb-4 px-6 py-3 flex justify-end gap-2 border-t border-slate-100">
          <sl-button type="button" variant="ghost" (click)="close()">Annuler</sl-button>
          <sl-button type="submit" variant="primary" [disabled]="form.invalid || charCount() > 500">
            {{ form.get('isAnonymous')?.value ? 'Publier (Anonyme)' : 'Publier (Signé)' }}
          </sl-button>
        </div>
      </form>
    </sl-modal>
  `
})
export class CreateConfessionModalComponent {
  private fb = inject(FormBuilder);
  private feedService = inject(FeedService);

  isOpen = signal(false);
  
  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(500)]],
    isAnonymous: [true]
  });

  get charCount() {
    return  signal(this.form.get('content')?.value?.length || 0);
  }

  // Monitor value changes for char count - actually let's use a cleaner signal way or just template getter
  // For simplicity in this structure:
  // We'll update a signal manually or rely on change detection. Since this is Angular 21 (hypothetically), 
  // Reactive forms + signals integration might be better, but we'll stick to standard check.
  
  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.form.reset();
  }

  submit() {
    if (this.form.valid) {
      this.feedService.addConfession(
        this.form.value.content || '', 
        'Dakar', // Location (mock)
        this.form.value.isAnonymous || false
      );
      this.close();
    }
  }
}
