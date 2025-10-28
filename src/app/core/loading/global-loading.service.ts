import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalLoadingService {
  private pending = 0;
  private visible = false;
  private showTimer: any = null;
  private hideTimer: any = null;
  private visibleSince = 0;

  private readonly delayMs = 350; // evita flicker em operações rápidas
  private readonly minVisibleMs = 600; // mantém visível por um tempo mínimo
  private readonly longWaitMs = 3000; // após esse tempo, mostra dica de lentidão

  readonly isVisible$ = new BehaviorSubject<boolean>(false);
  readonly hint$ = new BehaviorSubject<'normal' | 'slow'>('normal');

  start(): void {
    this.pending++;
    if (this.pending === 1) {
      // Primeiro request: agenda exibição com delay
      this.clearHideTimer();
      if (!this.showTimer) {
        this.showTimer = setTimeout(() => {
          this.showTimer = null;
          this.setVisible(true);
        }, this.delayMs);
      }
    }
  }

  stop(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending === 0) {
      // Ninguém mais pendente: decide esconder
      this.clearShowTimer();
      const now = Date.now();
      if (!this.visible) {
        // nunca exibiu: nada a fazer
        this.setVisible(false);
        return;
      }
      const elapsed = now - this.visibleSince;
      const remaining = Math.max(0, this.minVisibleMs - elapsed);
      this.clearHideTimer();
      this.hideTimer = setTimeout(() => {
        this.hideTimer = null;
        this.setVisible(false);
      }, remaining);
    }
  }

  reset(): void {
    this.pending = 0;
    this.clearShowTimer();
    this.clearHideTimer();
    this.setVisible(false);
  }

  private setVisible(v: boolean): void {
    if (this.visible === v) return;
    this.visible = v;
    if (v) {
      this.visibleSince = Date.now();
      this.hint$.next('normal');
      // agenda dica de lentidão
      setTimeout(() => {
        if (this.visible) this.hint$.next('slow');
      }, this.longWaitMs);
    }
    this.isVisible$.next(v);
  }

  private clearShowTimer(): void { if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; } }
  private clearHideTimer(): void { if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; } }
}

