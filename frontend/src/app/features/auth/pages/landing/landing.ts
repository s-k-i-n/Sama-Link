import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlButtonComponent } from '../../../../shared/ui/sl-button/sl-button';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, SlButtonComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-ivory text-night">
      <!-- Header -->
      <header class="container mx-auto px-4 py-6 flex justify-between items-center">
        <a routerLink="/" class="text-2xl font-bold tracking-tight text-sage">Sama Link</a>
        <div class="flex gap-4">
          <sl-button variant="ghost" routerLink="/auth/login">Se connecter</sl-button>
          <sl-button variant="primary" routerLink="/auth/register">S'inscrire</sl-button>
        </div>
      </header>

      <!-- Hero Section -->
      <main class="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Confessions. Rencontres.<br/>
          <span class="text-sage">En toute liberté.</span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12">
          La plateforme anonyme pour partager vos pensées et rencontrer des personnes qui vous comprennent vraiment. Pas de jugement, juste de la connexion.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
          <sl-button variant="primary" size="lg" [block]="true" routerLink="/auth/register">
            Commencer maintenant
          </sl-button>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div class="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center mb-4 text-2xl">🤫</div>
            <h3 class="text-xl font-semibold mb-2">Anonymat Garanti</h3>
            <p class="text-slate-600">Partagez vos confessions en toute sécurité. Votre identité reste protégée jusqu'à ce que vous décidiez de la révéler.</p>
          </div>
          <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div class="w-12 h-12 bg-amber/10 rounded-xl flex items-center justify-center mb-4 text-2xl">❤️</div>
            <h3 class="text-xl font-semibold mb-2">Rencontres Authentiques</h3>
            <p class="text-slate-600">Matchez avec des personnes basées sur vos valeurs et vos confessions, pas juste sur une photo.</p>
          </div>
          <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div class="w-12 h-12 bg-night/5 rounded-xl flex items-center justify-center mb-4 text-2xl">🌍</div>
            <h3 class="text-xl font-semibold mb-2">Communauté Locale</h3>
            <p class="text-slate-600">Rejoignez des milliers d'utilisateurs au Sénégal prêts à échanger et partager.</p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-slate-50 border-t border-slate-200 py-12">
        <div class="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2026 Sama Link. Fait avec passion à Dakar.</p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class LandingComponent { }
