import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomizationModeService {
  private readonly _enabled$ = new BehaviorSubject<boolean>(false);
  readonly changes$ = this._enabled$.asObservable();

  enabled(): boolean { return this._enabled$.value; }
  set(val: boolean): void { this._enabled$.next(!!val); }
  toggle(): void { this._enabled$.next(!this._enabled$.value); }
}

