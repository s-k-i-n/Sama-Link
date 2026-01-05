import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any) {
    console.error('🔥 Global Error Caught:', error);
    
    // Use injector to get ToastService lazily
    const toastService = this.injector.get(ToastService);
    
    const message = error.message || 'Une erreur inattendue est survenue.';
    toastService.error(message);
    
    // In production: Sentry.captureException(error);
  }
}
