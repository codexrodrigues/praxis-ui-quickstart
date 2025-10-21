import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { OperacoesService } from '../../../core/services/operacoes.service';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';
import { ResumoOperacional } from '../../shared/models';

@Component({
  selector: 'app-resumo',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatCardModule, DecimalPipe],
  template: `
    <div class="grid">
      <mat-card class="glass-panel" *ngIf="(resumo$ | async) as r">
        <mat-card-header>
          <mat-card-title>Resumo Operacional</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="kpis">
            <div>
              <small>Missões Ativas</small>
              <h2>{{ r.missoesAtivas }}</h2>
            </div>
            <div>
              <small>Ameaças Ativas</small>
              <h2>{{ r.ameacasAtivas }}</h2>
            </div>
            <div>
              <small>Reputação Média</small>
              <h2>{{ r.reputacaoMedia | number:'1.0-2' }}</h2>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns: 1fr; gap: 16px; }
    .kpis { display:flex; gap: 24px; justify-content: space-between; }
    .kpis > div { text-align:center; }
  `]
})
export class ResumoComponent {
  private ops = inject(OperacoesService);
  resumo$: Observable<ResumoOperacional> = this.ops.getResumo().pipe(
    startWith<ResumoOperacional>({ missoesAtivas: 2, ameacasAtivas: 3, reputacaoMedia: 0.82 }),
    catchError(() => of({ missoesAtivas: 0, ameacasAtivas: 0, reputacaoMedia: 0 }))
  );
}
