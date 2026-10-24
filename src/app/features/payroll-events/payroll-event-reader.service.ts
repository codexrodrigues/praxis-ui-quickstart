import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL, GenericCrudService, GlobalConfigService, SchemaNormalizerService } from '@praxisui/core';

export interface PayrollParentPrecondition {
  readonly folhaPagamentoId: number;
  readonly resourceVersion: string;
}

export interface PayrollEventSnapshot {
  readonly id: number;
  readonly descricao: string;
  readonly tipo: string;
  readonly valor: number;
  readonly folhaPagamentoId: number;
  readonly status: string;
  readonly precondicaoFolhaAtual: PayrollParentPrecondition;
}

export interface PayrollSnapshot extends Record<string, unknown> {
  readonly id: number;
  readonly reconciliacao: string;
  readonly estado?: string;
  readonly salarioBruto: number | null;
  readonly descontosBase: number | null;
  readonly dataPagamentoPrevista?: string;
  readonly dataPagamentoAgendada?: string;
  readonly dataPagamentoEfetiva?: string;
}

/** Separate configured readers never share the form's mutable CRUD configuration/cache. */
@Injectable()
export class PayrollEventReader {
  private readonly http = inject(HttpClient);
  private readonly schemas = inject(SchemaNormalizerService);
  private readonly config = inject(GlobalConfigService);
  private readonly api = inject(API_URL);
  readonly events = new GenericCrudService<PayrollEventSnapshot, number>(this.http, this.schemas, this.config, this.api);
  readonly payrolls = new GenericCrudService<PayrollSnapshot, number>(this.http, this.schemas, this.config, this.api);

  constructor() {
    this.events.configure('human-resources/eventos-folha');
    this.payrolls.configure('human-resources/folhas-pagamento');
  }
}
