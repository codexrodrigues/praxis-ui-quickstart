import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraxisFilterForm } from '@praxisui/dynamic-form';
import { FilterDrawerBridgeService } from './filter-drawer-bridge.service';
import { DrawerService } from '../drawer/drawer.service';

@Component({
  selector: 'app-filter-form-drawer-host',
  standalone: true,
  imports: [CommonModule, PraxisFilterForm],
  template: `
    <header class="drawer-header">
      <h3>{{ ctx?.title || 'Filtro Avançado' }}</h3>
      <div class="spacer"></div>
      <button type="button" class="btn" (click)="cancel()">Cancelar</button>
      <button type="button" class="btn primary" [disabled]="!valid" (click)="apply()">Aplicar</button>
    </header>
    <section class="drawer-body">
      <praxis-filter-form
        [formId]="ctx?.formId!"
        [resourcePath]="ctx?.resourcePath!"
        [mode]="'edit'"
        [config]="ctx?.config"
        (formReady)="onReady($event)"
        (valueChange)="onChange($event)"
        (validityChange)="onValidity($event)"
      ></praxis-filter-form>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .drawer-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.14); }
    .drawer-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: #eaeaf1; }
    .spacer { flex: 1 1 auto; }
    .drawer-body { padding: 8px 12px 12px; }
    .btn { height: 28px; padding: 0 10px; border-radius: 6px; background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .btn.primary { background: linear-gradient(90deg, #60a5fa, #8b5cf6); color: white; border-color: rgba(255,255,255,0.22); }
  `]
})
export class FilterFormDrawerHostComponent implements OnInit {
  private bridge = inject(FilterDrawerBridgeService);
  ctx = this.bridge.get();
  valid = true;
  private lastValue: Record<string, any> = {};
  private drawer = inject(DrawerService);

  ngOnInit(): void { this.ctx = this.bridge.get(); }

  onReady(_ev: any): void {
    if (this.ctx?.initialDto) this.lastValue = { ...this.ctx.initialDto };
  }
  onChange(ev: { formData: Record<string, any> }): void { this.lastValue = ev?.formData ?? {}; }
  onValidity(v: boolean): void { this.valid = v; }
  cancel(): void { try { this.ctx?.onClose?.(); } catch {}; this.drawer.close(); }
  apply(): void { try { this.ctx?.onSubmit?.(this.lastValue); } catch {}; this.drawer.close(); }
}
