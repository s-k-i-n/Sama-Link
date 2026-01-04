import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // Mock tracking for now
  trackEvent(category: string, action: string, label?: string, value?: number) {
    console.log(`[Analytics] Event: ${category} | ${action} | ${label || ''} | ${value || ''}`);
    // In production, this would call GTM or PostHog
  }

  trackPageView(path: string) {
    console.log(`[Analytics] Page View: ${path}`);
  }
}
