import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Indicador, Incidente, Indenizacao } from '../../features/shared/models';
import { GenericCrudService } from '@praxisui/core';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  constructor(private crud: GenericCrudService<any, any>) {}

  getIncidentes(): Observable<Incidente[]> {
    const svc: any = this.crud.configure('/human-resources/incidentes');
    return (svc.getAll ? svc.getAll() : of([])).pipe(
      map((data: any) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        return (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          descricao: String(it?.descricao ?? it?.titulo ?? '—'),
          severidade: this.mapSeveridade(it),
        }) as Incidente);
      })
    );
  }

  getIndenizacoes(): Observable<Indenizacao[]> {
    const svc: any = this.crud.configure('/human-resources/indenizacoes');
    return (svc.getAll ? svc.getAll() : of([])).pipe(
      map((data: any) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        return (list ?? []).map((it: any) => ({
          id: String(it?.id ?? ''),
          valor: this.mapValor(it),
          motivo: this.mapMotivo(it),
        }) as Indenizacao);
      })
    );
  }

  getIndicadores(): Observable<Indicador[]> {
    const vw: any = this.crud.configure('/human-resources/vw-indicadores-incidentes');
    const vw$ = vw.getAll ? vw.getAll() : of([]);
    return vw$.pipe(
      map((data: any) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        const mapped = (list ?? []).map((it: any, idx: number) => ({
          id: String(it?.id ?? it?.codigo ?? idx),
          label: String(it?.label ?? it?.nome ?? it?.titulo ?? 'Indicador'),
          valor: this.firstNumber(it, ['valor','total','quantidade','count','soma','media']) ?? 0,
          meta: this.firstNumber(it, ['meta','target','esperado','objetivo']) ?? undefined,
        }) as Indicador);
        if (mapped.length) return mapped;
        throw new Error('empty');
      }),
      catchError(() => this.fallbackIndicadores())
    );
  }

  // Helpers
  private mapSeveridade(it: any): Incidente['severidade'] {
    const raw = String(it?.severidade ?? it?.gravidade ?? '').toUpperCase();
    if (raw.includes('CRIT')) return 'critica';
    if (raw.includes('ALTA')) return 'alta';
    if (raw.includes('MED')) return 'media';
    if (raw.includes('BAIX')) return 'baixa';
    const nivel = Number(it?.nivel ?? it?.prioridade ?? 0);
    if (nivel >= 5) return 'critica';
    if (nivel >= 4) return 'alta';
    if (nivel >= 3) return 'media';
    return 'baixa';
  }

  private mapValor(it: any): number {
    const n = this.firstNumber(it, ['valor','valorTotal','total','montante','pago','valorPago']);
    return Number.isFinite(n as number) ? Number(n) : 0;
  }

  private mapMotivo(it: any): string {
    const m = String(it?.motivo ?? it?.justificativa ?? '').trim();
    if (m) return m;
    const proc = String(it?.processoNum ?? it?.processo ?? it?.numeroProcesso ?? '').trim();
    const seg = String(it?.seguradora ?? it?.empresa ?? '').trim();
    if (proc && seg) return `${seg} · Proc. ${proc}`;
    if (proc) return `Processo ${proc}`;
    if (seg) return `Seguradora: ${seg}`;
    return '—';
  }

  private firstNumber(obj: any, keys: string[]): number | undefined {
    try {
      for (const k of keys) {
        const v = obj?.[k];
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        const p = Number(v);
        if (!Number.isNaN(p) && Number.isFinite(p)) return p;
      }
    } catch {}
    return undefined;
  }

  private fallbackIndicadores(): Observable<Indicador[]> {
    // Se a VW não estiver disponível, agrega indicadores básicos a partir de endpoints reais
    const inc: any = this.crud.configure('/human-resources/incidentes');
    const ind: any = this.crud.configure('/human-resources/indenizacoes');
    const inc$ = inc.getAll ? inc.getAll() : of([]);
    const ind$ = ind.getAll ? ind.getAll() : of([]);
    return forkJoin({ inc: inc$, inden: ind$ }).pipe(
      map(({ inc, inden }: any) => {
        const incidentes = Array.isArray(inc) ? inc : (Array.isArray(inc?.content) ? inc.content : []);
        const indenizacoes = Array.isArray(inden) ? inden : (Array.isArray(inden?.content) ? inden.content : []);
        const totalIncidentes = incidentes.length;
        const totalIndenizado = (indenizacoes ?? []).reduce((s: number, it: any) => s + (this.mapValor(it) || 0), 0);
        const taxaIncidentes = totalIncidentes > 0 ? Math.min(1, totalIncidentes / 100) : 0; // heurística simples
        const kpis: Indicador[] = [
          { id: 'k1', label: 'Total Indenizado', valor: totalIndenizado },
          { id: 'k2', label: 'Incidentes Registrados', valor: totalIncidentes },
          { id: 'k3', label: 'Taxa de Incidentes', valor: Number(taxaIncidentes.toFixed(2)), meta: 0.2 },
        ];
        return kpis;
      }),
      catchError(() => of([] as Indicador[]))
    );
  }
}
