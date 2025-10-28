import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ameaca, Missao, ResumoOperacional } from '../../features/shared/models';

@Injectable({ providedIn: 'root' })
export class OperacoesService {
  constructor(private api: ApiClientService) {}

  // Alinha os endpoints de exemplo com a API Quickstart real
  // GET /api/human-resources/missoes/all
  getMissoes(): Observable<Missao[]> {
    return this.api
      .get<any[]>(`/human-resources/missoes/all`)
      .pipe(
        map(list => (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          titulo: String(it?.titulo ?? '—'),
          status: this.mapMissaoStatus(it?.status),
        }) as Missao))
      );
  }

  // GET /api/human-resources/ameacas/all
  getAmeacas(): Observable<Ameaca[]> {
    return this.api
      .get<any[]>(`/human-resources/ameacas/all`)
      .pipe(
        map(list => (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          tipo: String(it?.nome ?? '—'),
          risco: this.mapRiscoFromNivel(Number(it?.nivel ?? 0)),
        }) as Ameaca))
      );
  }

  // Calcula um resumo simples combinando recursos reais
  // - Missões ativas: status EM_ANDAMENTO
  // - Ameaças ativas: status != CAPTURADO/ELIMINADO
  // - Reputação média: média(scorePublico) normalizada para 0..1
  getResumo(): Observable<ResumoOperacional> {
    const missoes$ = this.api.get<any[]>(`/human-resources/missoes/all`);
    const ameacas$ = this.api.get<any[]>(`/human-resources/ameacas/all`);
    const reputacoes$ = this.api.get<any[]>(`/human-resources/reputacoes/all`);
    return forkJoin({ missoes: missoes$, ameacas: ameacas$, reps: reputacoes$ }).pipe(
      map(({ missoes, ameacas, reps }) => {
        const missoesAtivas = (missoes ?? []).filter((m: any) => String(m?.status) === 'EM_ANDAMENTO').length;
        const ameacasAtivas = (ameacas ?? []).filter((a: any) => !['CAPTURADO', 'ELIMINADO'].includes(String(a?.status))).length;
        const scores = (reps ?? []).map((r: any) => Number(r?.scorePublico ?? 0)).filter((n: number) => Number.isFinite(n));
        const avg = scores.length ? (scores.reduce((s: number, n: number) => s + n, 0) / scores.length) : 0;
        const reputacaoMedia = Math.max(0, Math.min(1, (avg + 100) / 200));
        return { missoesAtivas, ameacasAtivas, reputacaoMedia } as ResumoOperacional;
      })
    );
  }

  private mapMissaoStatus(status: any): Missao['status'] {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PLANEJADA': return 'planejada';
      case 'EM_ANDAMENTO': return 'em_andamento';
      case 'CONCLUIDA': return 'concluida';
      case 'PAUSADA': return 'em_andamento';
      case 'FALHOU': return 'cancelada';
      default: return 'planejada';
    }
  }

  private mapRiscoFromNivel(nivel: number): Ameaca['risco'] {
    const n = Number.isFinite(nivel) ? nivel : 0;
    if (n >= 5) return 'critico';
    if (n >= 4) return 'alto';
    if (n >= 3) return 'medio';
    return 'baixo';
  }
}
