import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { QUICKSTART_FIREBASE_ANALYTICS_CONFIG } from './firebase-analytics.config';
import type { Analytics } from 'firebase/analytics';

type AnalyticsConsent = 'unknown' | 'granted' | 'denied';

type AnalyticsRuntime = {
  analytics: Analytics;
  logPageView: (eventParams: Record<string, unknown>) => void;
};

const CONSENT_STORAGE_KEY = 'praxis.quickstart.analytics.consent.v1';

@Injectable({ providedIn: 'root' })
export class SiteAnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly consent = signal<AnalyticsConsent>(this.readStoredConsent());

  private runtimePromise: Promise<AnalyticsRuntime | null> | null = null;
  private started = false;
  private lastTrackedPath: string | null = null;

  readonly shouldShowConsentPrompt = computed(() => this.consent() === 'unknown');

  initialize(): void {
    if (!this.isBrowser || this.consent() !== 'granted') {
      return;
    }

    void this.startTracking();
  }

  acceptAnalytics(): void {
    this.storeConsent('granted');
    void this.startTracking();
  }

  declineAnalytics(): void {
    this.storeConsent('denied');
  }

  private async startTracking(): Promise<void> {
    if (!this.isBrowser || this.started) {
      return;
    }

    this.started = true;
    await this.trackPageView(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        void this.trackPageView(event.urlAfterRedirects);
      });
  }

  private async trackPageView(url: string): Promise<void> {
    const runtime = await this.getRuntime();
    if (!runtime) {
      return;
    }

    const pagePath = this.normalizePath(url);
    if (this.lastTrackedPath === pagePath) {
      return;
    }

    this.lastTrackedPath = pagePath;
    runtime.logPageView({
      page_location: `${window.location.origin}${pagePath}`,
      page_path: pagePath,
      page_title: this.title.getTitle(),
    });
  }

  private getRuntime(): Promise<AnalyticsRuntime | null> {
    this.runtimePromise ??= this.createAnalyticsRuntime();
    return this.runtimePromise;
  }

  private async createAnalyticsRuntime(): Promise<AnalyticsRuntime | null> {
    try {
      const [{ initializeApp }, { initializeAnalytics, isSupported, logEvent }] =
        await Promise.all([import('firebase/app'), import('firebase/analytics')]);

      if (!(await isSupported())) {
        return null;
      }

      const app = initializeApp(QUICKSTART_FIREBASE_ANALYTICS_CONFIG);
      const analytics = initializeAnalytics(app, {
        config: { send_page_view: false },
      });

      return {
        analytics,
        logPageView: (eventParams) => logEvent(analytics, 'page_view', eventParams),
      };
    } catch {
      return null;
    }
  }

  private normalizePath(url: string): string {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  private readStoredConsent(): AnalyticsConsent {
    if (!this.isBrowser) {
      return 'unknown';
    }

    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unknown';
  }

  private storeConsent(consent: AnalyticsConsent): void {
    this.consent.set(consent);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  }
}
