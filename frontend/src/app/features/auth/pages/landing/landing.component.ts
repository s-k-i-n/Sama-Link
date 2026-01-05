import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, SlButtonComponent],
  template: `
    <div class="min-h-relative flex flex-col bg-ivory text-night overflow-hidden selection:bg-sage/20">
      <!-- Animated Background Blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sage/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-night/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <!-- Header -->
      <header class="container mx-auto px-6 py-8 flex justify-between items-center relative z-10 animate-reveal">
        <a routerLink="/" class="text-2xl font-bold tracking-tight text-sage hover:scale-105 transition-transform duration-300">Sama Link</a>
        <div class="flex gap-4">
          <sl-button variant="ghost" routerLink="/auth/login">Se connecter</sl-button>
          <sl-button variant="primary" routerLink="/auth/register">S'inscrire</sl-button>
        </div>
      </header>

      <!-- Hero Section -->
      <main class="flex-grow flex flex-col items-center justify-center text-center px-4 py-24 relative z-10">
        <div class="animate-reveal [animation-delay:200ms]">
          <h1 class="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-none">
            Confessions.<br/>
            <span class="text-sage inline-block hover:scale-105 transition-transform duration-500 cursor-default">Rencontres.</span>
          </h1>
        </div>
        
        <p class="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 animate-reveal [animation-delay:400ms]">
          La plateforme anonyme pour partager vos pensées et rencontrer des personnes qui vous comprennent vraiment.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center animate-reveal [animation-delay:600ms]">
          <sl-button variant="primary" size="lg" [block]="true" routerLink="/auth/register" class="shadow-xl shadow-sage/20 hover:shadow-2xl hover:shadow-sage/30 transition-all">
            Commencer maintenant
          </sl-button>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full text-left">
          <div class="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 animate-reveal [animation-delay:800ms] hover:-translate-y-2 transition-all duration-500 group">
            <div class="relative w-16 h-16 mb-6 group">
                <!-- Outer rotating ring -->
                <div class="absolute inset-0 border-2 border-dashed border-sage/30 rounded-full animate-spin-slow"></div>
                <!-- Inner counter-rotating ring -->
                <div class="absolute inset-2 border border-dotted border-sage/50 rounded-full animate-spin-reverse-slow"></div>
                <!-- Icon container -->
                <div class="absolute inset-0 bg-sage/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  <span role="img" aria-label="Confession amoureuse Sénégal">🤫</span>
                </div>
            </div>
            <h3 class="text-2xl font-bold mb-3 tracking-tight">Anonymat Garanti</h3>
            <p class="text-slate-600 leading-relaxed">Partagez vos confessions en toute sécurité. Votre identité reste protégée jusqu'à ce que vous décidiez de la révéler.</p>
          </div>
          
          <div class="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 animate-reveal [animation-delay:1000ms] hover:-translate-y-2 transition-all duration-500 group">
            <div class="relative w-16 h-16 mb-6 group">
                <div class="absolute inset-0 border-2 border-dashed border-amber/30 rounded-full animate-spin-slow"></div>
                <div class="absolute inset-2 border border-dotted border-amber/50 rounded-full animate-spin-reverse-slow"></div>
                <div class="absolute inset-0 bg-amber/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">❤️</div>
            </div>
            <h3 class="text-2xl font-bold mb-3 tracking-tight">Rencontres Authentiques</h3>
            <p class="text-slate-600 leading-relaxed">Matchez avec des personnes basées sur vos valeurs et vos confessions, pas juste sur une photo.</p>
          </div>
          
          <div class="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 animate-reveal [animation-delay:1200ms] hover:-translate-y-2 transition-all duration-500 group">
            <div class="relative w-16 h-16 mb-6 group">
                <div class="absolute inset-0 border-2 border-dashed border-night/10 rounded-full animate-spin-slow"></div>
                <div class="absolute inset-2 border border-dotted border-night/20 rounded-full animate-spin-reverse-slow"></div>
                <div class="absolute inset-0 bg-night/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">🌍</div>
            </div>
            <h3 class="text-2xl font-bold mb-3 tracking-tight">Communauté Locale</h3>
            <p class="text-slate-600 leading-relaxed">Rejoignez des milliers d'utilisateurs au Sénégal prêts à échanger et partager.</p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-white/40 backdrop-blur-sm border-t border-slate-100 py-16 relative z-10">
        <div class="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p class="hover:text-sage transition-colors duration-300">&copy; 2026 Sama Link. Fait avec passion à Dakar.</p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class LandingComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);

  ngOnInit() {
    this.title.setTitle('Rencontres et Confessions en ligne | Trouve l\'Amour au Sénégal');
    this.meta.updateTag({ name: 'description', content: 'Bienvenue sur Sama Link, le lieu où les confessions et les rencontres amoureuses se rencontrent. Rejoins notre communauté au Sénégal et partage tes histoires.' });
    this.meta.updateTag({ property: 'og:title', content: 'Sama Link - Rencontres & Confessions au Sénégal' });
    this.meta.updateTag({ name: 'keywords', content: 'rencontres Sénégal, confessions anonymes dakar, amour sénégal, site de rencontre dakar' });
    this.meta.updateTag({ rel: 'canonical', href: 'https://samalink.sn/' });
  }
}
