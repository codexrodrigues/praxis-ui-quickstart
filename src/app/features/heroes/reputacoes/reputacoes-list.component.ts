import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { HeroesService } from '../../../core/services/heroes.service';
import { Reputacao } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-reputacoes-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatListModule],
  template: `
    <div class="glass-panel" style="padding:8px">
      <mat-list>
        <h3 matSubheader>Reputações</h3>
        <mat-list-item *ngFor="let r of (reputacoes$ | async) ?? []">
          <div matListItemTitle>{{ r.titulo }}</div>
          <div matListItemLine>Score: {{ r.score }}</div>
        </mat-list-item>
      </mat-list>
    </div>
  `
})
export class ReputacoesListComponent {
  private heroes = inject(HeroesService);
  reputacoes$: Observable<Reputacao[]> = this.heroes.getReputacoes().pipe(
    startWith<Reputacao[]>([
      { id: 'r1', titulo: 'Confiável', score: 85 },
      { id: 'r2', titulo: 'Discreto', score: 92 },
      { id: 'r3', titulo: 'Impiedoso', score: -12 },
    ]),
    catchError(() => of([] as Reputacao[]))
  );
}

