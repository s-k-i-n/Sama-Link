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
          
          <!-- Image Preview -->
          <div *ngIf="imagePreview()" class="mt-3 relative inline-block">
            <img [src]="imagePreview()" class="h-32 rounded-lg object-cover border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <button 
              type="button" 
              (click)="removeImage()" 
              class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors">
              ✕
            </button>
          </div>

          <div class="flex justify-between items-center mt-2">
            <!-- Add Image Button -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                (click)="fileInput.click()"
                class="p-2 text-slate-500 hover:text-sage hover:bg-sage/10 rounded-full transition-all flex items-center gap-2"
                [title]="selectedFile() ? 'Changer l\\'image' : 'Ajouter une photo'">
                <span class="text-xl">📷</span>
                <span class="text-xs font-medium" *ngIf="!selectedFile()">Photo</span>
              </button>
              <input 
                #fileInput 
                type="file" 
                (change)="onFileSelected($event)" 
                accept="image/*" 
                class="hidden">
            </div>

            <div class="flex items-center gap-2">
               <input type="checkbox" formControlName="isAnonymous" id="anon" class="checkbox checkbox-xs checkbox-success">
               <label for="anon" class="text-xs text-slate-500 cursor-pointer select-none">
                 Anonyme 🕵️
               </label>
               <span class="text-[10px] text-slate-400 ml-2" [ngClass]="{'text-red-500': charCount > 500}">
                 {{ charCount }}/500
               </span>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 -mx-6 -mb-4 px-6 py-3 flex justify-end gap-2 border-t border-slate-100">
          <sl-button type="button" variant="ghost" size="sm" (click)="close()">Annuler</sl-button>
          <sl-button type="submit" variant="primary" size="sm" [disabled]="form.invalid || charCount > 500 || isLoading()">
            {{ isLoading() ? 'Publication...' : 'Publier' }}
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
  isLoading = signal(false);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(500)]],
    isAnonymous: [true]
  });

  get charCount() {
    return this.form.get('content')?.value?.length || 0;
  }
  
  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.removeImage();
    this.form.reset({ isAnonymous: true });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 5 Mo)");
        return;
      }
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  submit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const location = 'Dakar'; 
      
      this.feedService.addConfession(
        this.form.value.content || '', 
        location,
        this.form.value.isAnonymous ?? true,
        this.selectedFile() || undefined
      ).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.close();
        },
        error: (err) => {
          this.isLoading.set(false);
          alert(err.error?.message || 'Erreur lors de la publication');
        }
      });
    }
  }
}
