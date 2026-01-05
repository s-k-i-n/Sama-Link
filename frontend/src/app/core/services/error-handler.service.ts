import { Injectable, ErrorHandler, Injector } from '@angular/core';
// Actually, global error handler shouldn't depend on UI components directly to avoid circular deps often
// We'll just log to console and potentially analytics

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {}

  handleError(error: any) {
    console.error('🔥 Global Error Caught:', error);
    // In production: Sentry.captureException(error);
    
    // Optional: Show toast if it's a critical UI error (requires careful injection)
  }
}
