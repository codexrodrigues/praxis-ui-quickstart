import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { OperacoesService } from '../../../core/services/operacoes.service';
import { Missao } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-missoes-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatChipsModule, MatCardModule],
  template: `
    <div class="grid">
      <mat-card class="glass-panel" *ngFor="let m of (missoes$ | async) ?? []">
        <mat-card-title>{{ m.titulo }}</mat-card-title>
        <mat-card-content>
          <mat-chip-set>
            <mat-chip>{{ m.status }}</mat-chip>
          </mat-chip-set>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}`]
})
export class MissoesListComponent {
  private ops = inject(OperacoesService);
  missoes$: Observable<Missao[]> = this.ops.getMissoes().pipe(
    startWith<Missao[]>([
      { id: 'm1', titulo: 'Operação Nebula', status: 'em_andamento' },
      { id: 'm2', titulo: 'Eclipse Zero', status: 'planejada' },
    ]),
    catchError(() => of([] as Missao[]))
  );
}

