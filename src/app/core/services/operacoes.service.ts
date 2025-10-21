import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { Ameaca, Missao, ResumoOperacional } from '../../features/shared/models';

@Injectable({ providedIn: 'root' })
export class OperacoesService {
  constructor(private api: ApiClientService) {}

  getMissoes(): Observable<Missao[]> {
    return this.api.get<Missao[]>(`/operacoes/missoes`);
  }

  getAmeacas(): Observable<Ameaca[]> {
    return this.api.get<Ameaca[]>(`/operacoes/ameacas`);
  }

  getResumo(): Observable<ResumoOperacional> {
    return this.api.get<ResumoOperacional>(`/operacoes/resumo`);
  }
}

