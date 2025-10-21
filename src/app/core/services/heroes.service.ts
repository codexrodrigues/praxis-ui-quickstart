import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { Habilidade, Perfil, Reputacao } from '../../features/shared/models';

@Injectable({ providedIn: 'root' })
export class HeroesService {
  constructor(private api: ApiClientService) {}

  getPerfis(): Observable<Perfil[]> {
    return this.api.get<Perfil[]>(`/heroes/perfis`);
  }

  getHabilidades(): Observable<Habilidade[]> {
    return this.api.get<Habilidade[]>(`/heroes/habilidades`);
  }

  getReputacoes(): Observable<Reputacao[]> {
    return this.api.get<Reputacao[]>(`/heroes/reputacoes`);
  }
}

