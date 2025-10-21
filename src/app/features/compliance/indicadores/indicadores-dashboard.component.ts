import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ComplianceService } from '../../../core/services/compliance.service';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';
import { Indicador } from '../../shared/models';

@Component({
  selector: 'app-indicadores-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, MatCardModule, DecimalPipe],
  template: `
    <div class="grid">
      <mat-card class="glass-panel" *ngFor="let kpi of (indicadores$ | async) ?? []">
        <mat-card-subtitle>{{ kpi.label }}</mat-card-subtitle>
        <mat-card-title>{{ kpi.valor | number:'1.0-2' }}</mat-card-title>
        <div *ngIf="kpi.meta as meta" style="opacity:.7">Meta: {{ meta | number:'1.0-2' }}</div>
      </mat-card>
    </div>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}`]
})
export class IndicadoresDashboardComponent {
  private comp = inject(ComplianceService);
  indicadores$: Observable<Indicador[]> = this.comp.getIndicadores().pipe(
    startWith<Indicador[]>([
      { id: 'k1', label: 'SLA', valor: 0.97, meta: 0.95 },
      { id: 'k2', label: 'MTTR', valor: 3.4, meta: 4.0 },
      { id: 'k3', label: 'Taxa de Incidentes', valor: 0.12, meta: 0.2 },
    ]),
    catchError(() => of([] as Indicador[]))
  );
}
