import { Injectable } from '@angular/core';

export interface FilterDrawerContext {
  resourcePath: string;
  formId: string;
  config: any;
  title?: string;
  onSubmit(dto: Record<string, any>): void;
  onClose?(): void;
  initialDto?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class FilterDrawerBridgeService {
  private _ctx: FilterDrawerContext | null = null;
  set(ctx: FilterDrawerContext) { this._ctx = ctx; }
  get(): FilterDrawerContext | null { return this._ctx; }
  clear(): void { this._ctx = null; }
}
