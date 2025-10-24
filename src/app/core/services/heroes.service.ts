import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Habilidade, Perfil, Reputacao } from '../../features/shared/models';

@Injectable({ providedIn: 'root' })
export class HeroesService {
  constructor(private api: ApiClientService) {}

  getPerfis(): Observable<Perfil[]> {
    // Alinha com a API real: view de perfis e mapeia para o tipo local
    return this.api
      .get<any[]>(`/human-resources/vw-perfil-heroi/all`)
      .pipe(
        map(list => (list ?? []).map((it: any) => ({
          id: String(it?.funcionarioId ?? it?.id ?? ''),
          nome: String(it?.nomeCompleto ?? it?.nome ?? it?.codinome ?? '—'),
          codinome: it?.codinome,
          reputacao: it?.scoreMedio != null ? String(it.scoreMedio) : undefined,
        }) as Perfil))
      );
  }

  getHabilidades(): Observable<Habilidade[]> {
    // Lista de habilidades (endpoint de listagem via /all) com mapeamento de campos
    return this.api
      .get<any[]>(`/human-resources/habilidades/all`)
      .pipe(
        map(list => (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          nome: String(it?.nome ?? '—'),
          nivel: Number(it?.nivelPoder ?? it?.nivel ?? 0),
        }) as Habilidade))
      );
  }

  getReputacoes(): Observable<Reputacao[]> {
    // Mapeia para estrutura simples: usa scorePublico como score
    return this.api
      .get<any[]>(`/human-resources/reputacoes/all`)
      .pipe(
        map(list => (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          titulo: `Funcionário ${it?.funcionarioId ?? '—'}`,
          score: Number(it?.scorePublico ?? 0),
        }) as Reputacao))
      );
  }
}
