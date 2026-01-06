import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.css',
})
export class AudioPlayerComponent implements OnDestroy {
  @Input() src!: string;
  
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  private audio = new Audio();

  ngOnChanges() {
     if (this.src) {
         this.audio.src = this.src;
         this.audio.addEventListener('loadedmetadata', () => {
             this.duration = this.audio.duration;
         });
         this.audio.addEventListener('timeupdate', () => {
             this.currentTime = this.audio.currentTime;
         });
         this.audio.addEventListener('ended', () => {
             this.isPlaying = false;
             this.currentTime = 0;
         });
     }
  }

  togglePlay() {
      if (this.isPlaying) {
          this.audio.pause();
      } else {
          this.audio.play();
      }
      this.isPlaying = !this.isPlaying;
  }

  formatTime(time: number): string {
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }

  ngOnDestroy() {
      this.audio.pause();
      this.audio = new Audio();
  }
}
