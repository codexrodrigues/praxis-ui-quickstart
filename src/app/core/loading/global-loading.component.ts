import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GlobalLoadingService } from './global-loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatProgressBarModule],
  template: `
    <div class="global-loader" *ngIf="svc.isVisible$ | async" aria-live="polite" aria-busy="true">
      <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
      <div class="overlay">
        <div class="spinner"></div>
        <div class="msg">
          <span>Carregando…</span>
          <small *ngIf="(svc.hint$ | async) === 'slow'">Servidor pode estar iniciando — aguarde alguns segundos.</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; pointer-events: none; z-index: 10000; }
    .global-loader { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr; }
    mat-progress-bar { height: 3px; }
    .overlay { display: flex; align-items: center; justify-content: center; }
    .overlay::before { content: ''; position: absolute; inset: 0; backdrop-filter: blur(2px); background: rgba(16,20,20,0.28); }
    .spinner { width: 38px; height: 38px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); border-top-color: #8b5cf6; animation: spin 0.9s linear infinite; }
    .msg { margin-left: 12px; color: #eaeaf1; text-shadow: 0 1px 2px rgba(0,0,0,.6); display:flex; flex-direction:column; gap:4px; }
    .msg small { opacity: .9; color: #c9c9d6; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class GlobalLoadingComponent {
  protected svc = inject(GlobalLoadingService);
}

