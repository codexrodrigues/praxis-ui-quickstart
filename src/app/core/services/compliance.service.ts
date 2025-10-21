import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { Indicador, Incidente, Indenizacao } from '../../features/shared/models';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  constructor(private api: ApiClientService) {}

  getIncidentes(): Observable<Incidente[]> {
    return this.api.get<Incidente[]>(`/compliance/incidentes`);
  }

  getIndenizacoes(): Observable<Indenizacao[]> {
    return this.api.get<Indenizacao[]>(`/compliance/indenizacoes`);
  }

  getIndicadores(): Observable<Indicador[]> {
    return this.api.get<Indicador[]>(`/compliance/indicadores`);
  }
}

