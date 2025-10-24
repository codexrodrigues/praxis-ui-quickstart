import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { HeroesService } from '../../../core/services/heroes.service';
import { Habilidade } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-habilidades-list',
  standalone: true,
  imports: [AsyncPipe, MatTableModule],
  template: `
    <table mat-table [dataSource]="(habilidades$ | async) ?? []" class="mat-elevation-z0 glass-panel">
      <ng-container matColumnDef="nome">
        <th mat-header-cell *matHeaderCellDef> Habilidade </th>
        <td mat-cell *matCellDef="let h"> {{h.nome}} </td>
      </ng-container>

      <ng-container matColumnDef="nivel">
        <th mat-header-cell *matHeaderCellDef> Nível </th>
        <td mat-cell *matCellDef="let h"> {{h.nivel}} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`table { width: 100%; padding: 8px; border-radius: 12px; }`]
})
export class HabilidadesListComponent {
  private heroes = inject(HeroesService);
  displayedColumns = ['nome', 'nivel'];
  habilidades$: Observable<Habilidade[]> = this.heroes.getHabilidades().pipe(
    startWith<Habilidade[]>([
      { id: 'h1', nome: 'Infiltração', nivel: 5 },
      { id: 'h2', nome: 'Defesa', nivel: 4 },
      { id: 'h3', nome: 'Logística', nivel: 3 },
    ]),
    catchError(() => of([] as Habilidade[]))
  );
}
