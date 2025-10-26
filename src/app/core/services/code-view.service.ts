import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CodeViewService {
  private readonly _showCode$ = new BehaviorSubject<boolean>(false);
  readonly showCode$ = this._showCode$.asObservable();

  isCode(): boolean { return this._showCode$.value; }
  set(val: boolean): void { this._showCode$.next(!!val); }
  toggle(): void { this._showCode$.next(!this._showCode$.value); }
}

