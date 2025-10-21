import { AsyncPipe, CurrencyPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ComplianceService } from '../../../core/services/compliance.service';
import { Indenizacao } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-indenizacoes-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatTableModule, CurrencyPipe],
  template: `
    <table mat-table [dataSource]="(indenizacoes$ | async) ?? []" class="mat-elevation-z0 glass-panel">
      <ng-container matColumnDef="motivo">
        <th mat-header-cell *matHeaderCellDef> Motivo </th>
        <td mat-cell *matCellDef="let i"> {{i.motivo}} </td>
      </ng-container>
      <ng-container matColumnDef="valor">
        <th mat-header-cell *matHeaderCellDef> Valor </th>
        <td mat-cell *matCellDef="let i"> {{i.valor | currency:'BRL'}} </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`table { width: 100%; padding: 8px; border-radius: 12px; }`]
})
export class IndenizacoesListComponent {
  private comp = inject(ComplianceService);
  displayedColumns = ['motivo', 'valor'];
  indenizacoes$: Observable<Indenizacao[]> = this.comp.getIndenizacoes().pipe(
    startWith<Indenizacao[]>([
      { id: 'p1', motivo: 'Falha de serviço', valor: 15000 },
      { id: 'p2', motivo: 'Dano colateral', valor: 8200 },
    ]),
    catchError(() => of([] as Indenizacao[]))
  );
}
