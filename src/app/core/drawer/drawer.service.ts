import { Injectable, Type, ViewContainerRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private container?: ViewContainerRef;
  private sidenav?: MatSidenav;
  private lastRef?: any;

  readonly opened$ = new BehaviorSubject<boolean>(false);

  register(container: ViewContainerRef, sidenav: MatSidenav): void {
    this.container = container;
    this.sidenav = sidenav;
  }

  open<T>(component: Type<T>): void {
    if (!this.container || !this.sidenav) return;
    try {
      this.container.clear();
      this.lastRef = this.container.createComponent(component);
      this.sidenav.open();
      this.opened$.next(true);
    } catch (e) {
      console.warn('[DrawerService] open failed:', e);
    }
  }

  detach(): void {
    try { this.container?.clear(); } catch {}
    try { this.lastRef?.destroy?.(); } catch {}
    this.lastRef = undefined;
    this.opened$.next(false);
  }

  close(): void {
    try { this.sidenav?.close(); } catch {}
    this.detach();
  }
}

