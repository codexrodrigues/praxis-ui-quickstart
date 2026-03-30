import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  ADVANCED_CATALOG_LINKS,
  CORE_CATALOG_LINKS,
  HERO_FACTS,
  HOME_INTRO,
  PRAXIS_API_BASE_URL,
  PRAXIS_API_ORIGIN,
  SETUP_STEPS,
  THEME_OWNERSHIP_POINTS,
} from '../quickstart-content';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="landing">
      <header class="hero">
        <div class="hero-copy">
          <p class="eyebrow">{{ intro.eyebrow }}</p>
          <h1>{{ intro.title }}</h1>
          <p class="hero-description">
            Start with the canonical host path, prove the same published resource in four core runtimes, and keep the
            theme owned by your Angular host.
          </p>

          <div class="hero-facts">
            @for (fact of heroFacts; track fact) {
              <span>{{ fact }}</span>
            }
          </div>
        </div>

        <div class="hero-note">
          <h2>Published API</h2>
          <p>{{ apiOrigin }}</p>
          <small>{{ apiBaseUrl }}</small>
        </div>
      </header>

      <section class="setup-section">
        <div class="section-heading">
          <p class="section-eyebrow">Core path</p>
          <h2>First 10 minutes</h2>
        </div>

        <div class="setup-grid">
          @for (step of steps; track step.title; let index = $index) {
            <article class="setup-card">
              <span class="setup-index">0{{ index + 1 }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.detail }}</p>
            </article>
          }
        </div>
      </section>

      <section class="theme-section">
        <div class="section-heading">
          <p class="section-eyebrow">Theme ownership</p>
          <h2>The host keeps the visual identity</h2>
          <p>
            Praxis resolves metadata and runtime behavior. Your company theme still owns tokens, typography, spacing,
            density, and branding decisions.
          </p>
        </div>

        <div class="theme-grid">
          @for (point of themeOwnershipPoints; track point.title) {
            <article class="theme-card">
              <h3>{{ point.title }}</h3>
              <p>{{ point.detail }}</p>
            </article>
          }
        </div>
      </section>

      <section class="catalog-section">
        <div class="section-heading">
          <p class="section-eyebrow">Core examples</p>
          <h2>Start here</h2>
          <p>These are the four examples that prove the canonical adoption path.</p>
        </div>

        <div class="catalog-grid">
          @for (item of coreLinks; track item.route) {
            <article class="catalog-item">
              <div class="catalog-icon">
                <mat-icon>{{ item.icon }}</mat-icon>
              </div>
              <div class="catalog-copy">
                <a [routerLink]="item.route">{{ item.title }}</a>
                <p>{{ item.description }}</p>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="catalog-section catalog-section-secondary">
        <div class="section-heading">
          <p class="section-eyebrow">Advanced examples</p>
          <h2>Expand after the host is proven</h2>
          <p>These patterns stay available, but they are intentionally outside the primary navigation.</p>
        </div>

        <div class="catalog-grid">
          @for (item of advancedLinks; track item.route) {
            <article class="catalog-item">
              <div class="catalog-icon">
                <mat-icon>{{ item.icon }}</mat-icon>
              </div>
              <div class="catalog-copy">
                <a [routerLink]="item.route">{{ item.title }}</a>
                <p>{{ item.description }}</p>
              </div>
            </article>
          }
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .landing {
        display: grid;
        gap: 32px;
        padding: 8px 0 32px;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.8fr);
        gap: 28px;
        align-items: start;
      }

      .eyebrow,
      .section-eyebrow {
        margin: 0;
        color: var(--md-sys-color-on-surface-variant);
        font-size: 0.9rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p,
      small {
        margin: 0;
      }

      h1,
      h2,
      h3 {
        font-family: var(--font-display);
        color: #111;
      }

      .hero-copy,
      .section-heading {
        display: grid;
        gap: 12px;
      }

      .hero-copy {
        max-width: 48rem;
      }

      .hero-copy h1 {
        font-size: clamp(2.1rem, 4vw, 3.5rem);
        line-height: 1.02;
      }

      .hero-description,
      .section-heading p:last-child {
        color: var(--md-sys-color-on-surface-variant);
        line-height: 1.5;
      }

      .hero-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .hero-facts span {
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        font-size: 0.92rem;
        font-weight: 600;
      }

      .hero-note,
      .setup-card,
      .theme-card,
      .catalog-item {
        border: 1px solid #dce3ef;
        border-radius: 18px;
        background: #fff;
      }

      .hero-note {
        display: grid;
        gap: 8px;
        padding: 20px;
      }

      .hero-note p,
      .catalog-copy a {
        color: var(--md-sys-color-primary);
        font-weight: 700;
      }

      .hero-note small {
        color: var(--md-sys-color-on-surface-variant);
        word-break: break-word;
      }

      .setup-section,
      .theme-section,
      .catalog-section {
        display: grid;
        gap: 18px;
      }

      .setup-grid,
      .theme-grid,
      .catalog-grid {
        display: grid;
        gap: 18px;
      }

      .setup-grid,
      .theme-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .catalog-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .setup-card,
      .theme-card {
        display: grid;
        gap: 10px;
        padding: 20px;
      }

      .setup-index {
        color: var(--md-sys-color-primary);
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.08em;
      }

      .catalog-item {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: 14px;
        align-items: start;
        padding: 18px;
      }

      .catalog-icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        color: var(--md-sys-color-primary);
      }

      .catalog-icon mat-icon {
        width: 28px;
        height: 28px;
        font-size: 28px;
      }

      .catalog-copy {
        display: grid;
        gap: 6px;
      }

      .catalog-copy a {
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .catalog-copy p,
      .setup-card p,
      .theme-card p {
        color: var(--md-sys-color-on-surface-variant);
        line-height: 1.45;
      }

      .catalog-section-secondary {
        padding-top: 8px;
        border-top: 1px dashed #aab5c7;
      }

      @media (max-width: 900px) {
        .setup-grid,
        .theme-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .hero,
        .catalog-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomePageComponent {
  protected readonly intro = HOME_INTRO;
  protected readonly heroFacts = HERO_FACTS;
  protected readonly steps = SETUP_STEPS;
  protected readonly themeOwnershipPoints = THEME_OWNERSHIP_POINTS;
  protected readonly coreLinks = CORE_CATALOG_LINKS;
  protected readonly advancedLinks = ADVANCED_CATALOG_LINKS;
  protected readonly apiOrigin = PRAXIS_API_ORIGIN;
  protected readonly apiBaseUrl = PRAXIS_API_BASE_URL;
}
