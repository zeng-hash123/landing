/**
 * Lightweight analytics event tracker for PixelPage Phase 1.
 */

export type AnalyticsEvent =
  | 'audit_started'
  | 'audit_completed'
  | 'audit_failed'
  | 'signup_completed'
  | 'copy_suggestion_copied';

export function trackEvent(event: AnalyticsEvent, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    console.log(`[Analytics Event: ${event}]`, metadata || {});

    // Forward to window.gtag if present
    if ((window as any).gtag) {
      (window as any).gtag('event', event, metadata);
    }
  } catch (err) {
    console.error('Failed to log analytics event:', err);
  }
}
