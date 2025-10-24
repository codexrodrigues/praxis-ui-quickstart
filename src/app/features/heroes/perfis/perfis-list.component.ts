import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HeroesService } from '../../../core/services/heroes.service';
import { Perfil } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-perfis-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatCardModule, MatButtonModule],
  template: `
    <div class="grid">
      <mat-card class="glass-panel" *ngFor="let p of (perfis$ | async) ?? []">
        <mat-card-header>
          <mat-card-title>{{ p.nome }}</mat-card-title>
          <mat-card-subtitle>{{ p.codinome || '—' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div>Reputação: {{ p.reputacao || 'N/A' }}</div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="editar(p)">Editar</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  `]
})
export class PerfisListComponent {
  private heroes = inject(HeroesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  perfis$: Observable<Perfil[]> = this.heroes.getPerfis().pipe(
    startWith<Perfil[]>([
      { id: '1', nome: 'Aurora', codinome: 'Lightbringer', reputacao: 'A' },
      { id: '2', nome: 'Sentinela', codinome: 'Watchman', reputacao: 'B' },
      { id: '3', nome: 'Specter', codinome: 'Shade', reputacao: 'A+' },
    ]),
    catchError(() => of([] as Perfil[]))
  );

  editar(p: Perfil) {
    this.router.navigate([
      { outlets: { aside: ['heroes', 'perfis', p.id, 'editar'] } }
    ], { relativeTo: this.route.root });
  }
}
