import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ComplianceService } from '../../../core/services/compliance.service';
import { Incidente } from '../../shared/models';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-incidentes-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, MatTableModule],
  template: `
    <table mat-table [dataSource]="(incidentes$ | async) ?? []" class="mat-elevation-z0 glass-panel">
      <ng-container matColumnDef="descricao">
        <th mat-header-cell *matHeaderCellDef> Incidente </th>
        <td mat-cell *matCellDef="let i"> {{i.descricao}} </td>
      </ng-container>
      <ng-container matColumnDef="severidade">
        <th mat-header-cell *matHeaderCellDef> Severidade </th>
        <td mat-cell *matCellDef="let i"> {{i.severidade}} </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`table { width: 100%; padding: 8px; border-radius: 12px; }`]
})
export class IncidentesListComponent {
  private comp = inject(ComplianceService);
  displayedColumns = ['descricao', 'severidade'];
  incidentes$: Observable<Incidente[]> = this.comp.getIncidentes().pipe(
    startWith<Incidente[]>([
      { id: 'i1', descricao: 'Acesso não autorizado', severidade: 'alta' },
      { id: 'i2', descricao: 'Exfiltração de dados', severidade: 'critica' },
    ]),
    catchError(() => of([] as Incidente[]))
  );
}

