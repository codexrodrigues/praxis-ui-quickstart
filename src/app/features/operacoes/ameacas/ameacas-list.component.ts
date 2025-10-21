import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { OperacoesService } from '../../../core/services/operacoes.service';
import { Ameaca } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-ameacas-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatListModule],
  template: `
    <div class="glass-panel" style="padding:8px">
      <mat-list>
        <h3 matSubheader>Ameaças</h3>
        <mat-list-item *ngFor="let a of (ameacas$ | async) ?? []">
          <div matListItemTitle>{{ a.tipo }}</div>
          <div matListItemLine>Risco: {{ a.risco }}</div>
        </mat-list-item>
      </mat-list>
    </div>
  `
})
export class AmeacasListComponent {
  private ops = inject(OperacoesService);
  ameacas$: Observable<Ameaca[]> = this.ops.getAmeacas().pipe(
    startWith<Ameaca[]>([
      { id: 'a1', tipo: 'Intrusão Externa', risco: 'alto' },
      { id: 'a2', tipo: 'Vazamento de Dados', risco: 'critico' },
    ]),
    catchError(() => of([] as Ameaca[]))
  );
}

