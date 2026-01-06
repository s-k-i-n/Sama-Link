import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ModerationService } from '../../../../core/services/moderation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AudioPlayerComponent } from '../../../../shared/components/audio-player/audio-player';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioPlayerComponent],
  template: `
    <div class="flex flex-col h-screen bg-slate-50">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm z-10 relative">
        <button (click)="goBack()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
          ⬅
        </button>
        
        <div class="relative w-10 h-10 flex-shrink-0">
           <div class="w-full h-full rounded-full bg-slate-200 overflow-hidden">
               <img *ngIf="activeChat()?.userPhotoUrl" [src]="activeChat()?.userPhotoUrl" class="w-full h-full object-cover">
               <div *ngIf="!activeChat()?.userPhotoUrl" class="w-full h-full flex items-center justify-center bg-amber text-white font-bold">
                 {{ activeChat()?.userAlias?.charAt(0) }}
               </div>
           </div>
           <span *ngIf="isActive()" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        
        <div class="flex-grow">
           <h2 class="font-bold text-slate-900">{{ activeChat()?.userAlias }}</h2>
           <span *ngIf="isActive()" class="text-xs text-green-600 flex items-center gap-1">En ligne</span>
           <span *ngIf="activeChat()?.isTyping" class="text-xs text-slate-400 italic">écrit...</span>
        </div>

        <button (click)="toggleMenu()" class="p-2 text-slate-400 hover:bg-slate-100 rounded-full">⋮</button>

        <!-- Menu -->
        <div *ngIf="isMenuOpen()" class="absolute right-4 top-14 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20">
             <button (click)="blockUser()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">🚫 Bloquer</button>
        </div>
        <div *ngIf="isMenuOpen()" (click)="toggleMenu()" class="fixed inset-0 z-0"></div>
      </div>

      <!-- Messages Area -->
      <div class="flex-grow overflow-y-auto p-4 space-y-4" #scrollContainer>
         <ng-container *ngFor="let msg of activeChat()?.messages">
           <div class="flex" [ngClass]="msg.senderId === authService.currentUser()?.id ? 'justify-end' : 'justify-start'">
              <div 
                class="max-w-[75%] rounded-2xl shadow-sm text-sm relative group overflow-hidden"
                [ngClass]="msg.senderId === authService.currentUser()?.id ? 'bg-sage text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'">
                
                <!-- TEXT -->
                <div *ngIf="!msg.type || msg.type === 'TEXT'" class="px-4 py-2">
                    {{ msg.content }}
                </div>

                <!-- IMAGE -->
                <div *ngIf="msg.type === 'IMAGE'">
                    <img [src]="msg.content" class="max-w-full h-auto rounded-t-lg min-w-[150px]" (click)="previewImage(msg.content)">
                </div>

                <!-- AUDIO -->
                <div *ngIf="msg.type === 'AUDIO'" class="px-2 py-1">
                    <app-audio-player [src]="msg.content"></app-audio-player>
                </div>
                
                <div class="text-[10px] opacity-70 px-4 pb-1 text-right" [ngClass]="{'text-white/80': msg.senderId === authService.currentUser()?.id, 'text-slate-400': msg.senderId !== authService.currentUser()?.id && msg.type !== 'IMAGE'}">
                   {{ msg.timestamp | date:'shortTime' }}
                   <span *ngIf="msg.senderId === authService.currentUser()?.id">
                     {{ msg.isRead ? '✓✓' : '✓' }}
                   </span>
                </div>
              </div>
           </div>
         </ng-container>
      </div>

      <!-- Recording Overlay -->
      <div *ngIf="isRecording()" class="absolute bottom-20 left-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse z-20">
          <div class="flex items-center gap-3">
              <span class="w-3 h-3 bg-white rounded-full animate-ping"></span>
              <span class="font-bold">Enregistrement... {{ recordingDuration() }}s</span>
          </div>
          <button (click)="stopRecording(false)" class="bg-white/20 p-2 rounded-full hover:bg-white/30">❌ Annuler</button>
      </div>

      <!-- Input Area -->
      <div class="bg-white p-3 border-t border-slate-200">
         <form (ngSubmit)="send()" class="flex gap-2 items-end max-w-4xl mx-auto">
            <!-- File Input -->
            <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*,audio/*">
            
            <button type="button" (click)="fileInput.click()" class="p-3 text-slate-400 hover:bg-slate-50 rounded-full shrink-0">
               📎
            </button>
            
            <div class="flex-grow bg-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-sage focus-within:bg-white transition-all">
               <input 
                 [(ngModel)]="newMessage" 
                 name="message"
                 (input)="onTyping()"
                 (blur)="onStopTyping()"
                 class="w-full bg-transparent border-none focus:ring-0 p-1 max-h-32 resize-none placeholder-slate-400 outline-none" 
                 placeholder="Message..." 
                 autocomplete="off"
               >
            </div>
            
            <!-- Send or Mic -->
            <button 
              *ngIf="newMessage.trim()"
              type="submit" 
              class="p-3 bg-sage text-white rounded-full shadow-md hover:bg-emerald-600 transition-all shrink-0">
               ➤
            </button>
            
            <button 
              *ngIf="!newMessage.trim()" 
              type="button"
              (mousedown)="startRecording()"
              (mouseup)="stopRecording()"
              (mouseleave)="stopRecording(false)"
              (touchstart)="startRecording()"
              (touchend)="stopRecording()"
              class="p-3 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-all shrink-0 cursor-pointer select-none active:scale-95 active:bg-red-100 active:text-red-500">
               🎤
            </button>
         </form>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  private moderationService = inject(ModerationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  activeChat = this.chatService.activeChat;
  newMessage = '';
  isMenuOpen = signal(false);
  
  // Recording
  isRecording = signal(false);
  recordingDuration = signal(0);
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  timerInterval: any;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit() {
    this.route.params.subscribe(params => {
       const id = params['id'];
       if (id) this.chatService.setActiveChat(id);
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
     this.onStopTyping();
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // Helper
  isActive() {
      // Mock for now or hook to socket event
      return false; // this.activeChat()?.isOnline
  }

  goBack() { this.router.navigate(['/messages']); }
  toggleMenu() { this.isMenuOpen.update(v => !v); }
  blockUser() { /* ... */ }

  // Typing
  typingTimeout: any;
  onTyping() {
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      this.chatService.sendTypingStatus(true);
      this.typingTimeout = setTimeout(() => this.onStopTyping(), 2000);
  }
  onStopTyping() {
      this.chatService.sendTypingStatus(false);
  }

  // RECORDING
  async startRecording() {
      if (!this.newMessage.trim()) {
         try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             this.mediaRecorder = new MediaRecorder(stream);
             this.audioChunks = [];
             
             this.mediaRecorder.ondataavailable = event => {
                 this.audioChunks.push(event.data);
             };

             this.mediaRecorder.start();
             this.isRecording.set(true);
             this.recordingDuration.set(0);
             
             this.timerInterval = setInterval(() => {
                 this.recordingDuration.update(d => d + 1);
             }, 1000);

         } catch(e) {
             console.error('Mic Error', e);
             alert("Impossible d'accéder au micro");
         }
      }
  }

  stopRecording(send: boolean = true) {
      if (this.isRecording() && this.mediaRecorder) {
          this.mediaRecorder.onstop = () => {
              const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
              if (send && this.recordingDuration() > 1) { // Min 1 sec
                  this.uploadAndSend(audioBlob, 'AUDIO');
              }
              this.isRecording.set(false);
              clearInterval(this.timerInterval);
              this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
          };
          this.mediaRecorder.stop();
      } else {
           this.isRecording.set(false);
           clearInterval(this.timerInterval);
           if (this.mediaRecorder) this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
  }

  // FILE UPLOAD
  onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          const type = file.type.startsWith('image') ? 'IMAGE' : (file.type.startsWith('audio') ? 'AUDIO' : null);
          if (type) {
              this.uploadAndSend(file, type);
          } else {
              alert('Format non supporté');
          }
      }
  }

  uploadAndSend(blob: Blob | File, type: string) {
      // Mock File object
      const file = new File([blob], type === 'AUDIO' ? 'voice.webm' : (blob as File).name, { type: blob.type });
      
      this.chatService.uploadMedia(file).subscribe({
          next: (res) => {
              this.chatService.sendMessage(res.url, res.type, res.metadata);
          },
          error: (err) => console.error('Upload Failed', err)
      });
  }

  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
      this.onStopTyping();
    }
  }
  
  previewImage(src: string) {
      window.open(src, '_blank');
  }
}
