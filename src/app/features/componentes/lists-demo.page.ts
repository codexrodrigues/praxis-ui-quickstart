import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraxisList } from '@praxisui/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-lists-demo-page',
  standalone: true,
  imports: [CommonModule, PraxisList, MatTooltipModule],
  template: `
    <section class="didactic-card gradient-border" aria-label="Listas ricas">
      <div class="card-body">
        <div class="intro">
          <h3 class="title">Praxis Lists — exemplos ricos
            <span class="hint-icon material-symbols-outlined"
                  matTooltip="Ative 'Ativar edição' no topo e clique no ícone de configurações da lista para abrir o editor. Ajuste variant, lines, metaPlacement, groupBy e slots."
                  matTooltipPosition="below"
                  aria-label="Ajuda sobre o editor">help</span>
          </h3>
          <p class="subtitle">Listas/cartões configuráveis com dados reais, ícones e formatação.</p>
        </div>
      </div>
    </section>

    <div class="grid">
      <!-- VW_RESUMO_MISSOES -->
      <div class="panel glass-panel">
        <h4 class="panel-title"><span class="material-symbols-outlined">flag</span>Resumo de Missões</h4>
        <praxis-list [config]="cfgResumoMissoes" (itemClick)="noop($event)" (actionClick)="onAction($event)" (selectionChange)="onSelection($event)"></praxis-list>
      </div>

      <!-- VW_RANKING_REPUTACAO → cards -->
      <div class="panel glass-panel">
        <h4 class="panel-title"><span class="material-symbols-outlined">military_tech</span>Ranking de Reputação</h4>
        <praxis-list [config]="cfgRanking" (itemClick)="noop($event)" (actionClick)="onAction($event)" (selectionChange)="onSelection($event)"></praxis-list>
      </div>

      <!-- VW_PERFIL_HEROI -->
      <div class="panel glass-panel">
        <h4 class="panel-title"><span class="material-symbols-outlined">person</span>Perfis de Herói</h4>
        <praxis-list [config]="cfgPerfis" (itemClick)="noop($event)" (actionClick)="onAction($event)"></praxis-list>
      </div>

      <!-- VW_INDICADORES_INCIDENTES -->
      <div class="panel glass-panel">
        <h4 class="panel-title"><span class="material-symbols-outlined">report</span>Indicadores de Incidentes</h4>
        <praxis-list [config]="cfgIndicadores" (itemClick)="noop($event)" (actionClick)="onAction($event)" (selectionChange)="onSelection($event)"></praxis-list>
      </div>
    </div>
    <div class="toast" *ngIf="status">{{ status }}</div>
  `,
  styles: [`
    :host { display:block; }
    .didactic-card { margin-bottom: 10px; border-radius: 10px; }
    .didactic-card .card-body { padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
    .title { margin: 0 0 6px; font-size: 18px; font-weight: 800; letter-spacing: .2px; color: var(--text-strong); }
    .subtitle { margin: 0; color: var(--text-muted); }
    .hint-icon { margin-left: 6px; font-size: 18px; vertical-align: middle; color: var(--brand-grad-end, #8b5cf6); cursor: help; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 12px; }
    .panel { padding: 8px; border-radius: 12px; }
    .panel-title { display:flex; align-items:center; gap:6px; margin: 0 0 6px; font-weight: 700; }
    .toast { margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: rgba(28, 200, 138, 0.12); border: 1px solid rgba(28, 200, 138, 0.4); color: #c7f5dc; font-size: 12px; }
    /* quick color helpers for icons/chips */
    .accent { color: var(--brand-grad-end, #8b5cf6); }
    .primary { color: #60a5fa; }
    .warn { color: #f59e0b; }
  `]
})
export class ListsDemoPage {
  status = '';

  // 1) Resumo de Missões — list com ícones e contagens
  cfgResumoMissoes = {
    id: 'vw-resumo-missoes',
    dataSource: { resourcePath: '/human-resources/vw-resumo-missoes', sort: ['prioridade,desc'] },
    layout: { variant: 'list', lines: 2, dividers: 'between' },
    selection: { mode: 'single', compareBy: 'missaoId', return: 'item' },
    templating: {
      leading: { type: 'icon', expr: 'flag', class: 'accent' },
      primary: { type: 'text', expr: '${item.titulo}' },
      secondary: { type: 'text', expr: 'Ameaça: ${item.ameaca} • Local: ${item.local}' },
      meta: { type: 'chip', expr: '${item.status}', class: 'chip-status' },
      trailing: { type: 'chip', expr: 'Prioridade ${item.prioridade}', class: 'chip-prioridade' },
      features: [
        { icon: 'group', expr: '${item.qtdHerois} heróis' },
        { icon: 'event', expr: '${item.qtdEventos} eventos' },
      ],
    },
    actions: [
      { id: 'pin', icon: 'push_pin', label: 'Fixar' },
    ],
  } satisfies import('@praxisui/list').PraxisListConfig;

  // 2) Ranking de Reputação — cards, destaque para posição e média
  cfgRanking = {
    id: 'vw-ranking-reputacao',
    dataSource: { resourcePath: '/human-resources/vw-ranking-reputacao', sort: ['posicao,asc'] },
    layout: { variant: 'cards', lines: 2 } as any,
    selection: { mode: 'multiple', compareBy: 'funcionarioId', return: 'ids' } as any,
    templating: {
      leading: { type: 'icon', expr: 'military_tech', class: 'warn' },
      primary: { type: 'text', expr: '${item.codinome || item.nomeCompleto}' },
      secondary: { type: 'text', expr: 'Equipe: ${item.equipe}' },
      meta: { type: 'chip', expr: 'Posição ${item.posicao}', class: 'chip-pos' },
      features: [
        { icon: 'stars', expr: 'Público: ${item.scorePublico}' },
        { icon: 'workspace_premium', expr: 'Gov.: ${item.scoreGovernamental}' },
        { icon: 'insights', expr: 'Média: ${item.media}' },
      ],
    },
    actions: [
      { id: 'profile', icon: 'visibility', label: 'Perfil' },
      { id: 'favorite', icon: 'favorite', label: 'Favoritar' },
    ],
  } satisfies import('@praxisui/list').PraxisListConfig;

  // 3) Perfil do Herói — list com skills e scores
  cfgPerfis = {
    id: 'vw-perfil-heroi',
    dataSource: { resourcePath: '/human-resources/vw-perfil-heroi', sort: ['scoreMedio,desc'] },
    layout: { variant: 'list', lines: 2, dividers: 'between' },
    templating: {
      leading: { type: 'icon', expr: 'person', class: 'primary' },
      primary: { type: 'text', expr: '${item.codinome || item.nomeCompleto}' },
      secondary: { type: 'text', expr: 'Depto: ${item.departamento} • Cargo: ${item.cargo}' },
      meta: { type: 'chip', expr: 'Score ${item.scoreMedio}', class: 'chip-score' },
      features: [
        { icon: 'bolt', expr: '${item.habilidades}' },
        { icon: 'public', expr: 'Pub: ${item.scorePublico}' },
        { icon: 'verified_user', expr: 'Gov: ${item.scoreGovernamental}' },
      ],
    },
    actions: [
      { id: 'contact', icon: 'mail', label: 'Contato' },
    ],
  } satisfies import('@praxisui/list').PraxisListConfig;

  // 4) Indicadores de Incidentes — cards enfatizando valores monetários
  cfgIndicadores = {
    id: 'vw-indicadores-incidentes',
    dataSource: { resourcePath: '/human-resources/vw-indicadores-incidentes', sort: ['ocorridoEm,desc'] },
    layout: { variant: 'cards', lines: 2, groupBy: 'severidade' },
    templating: {
      leading: { type: 'icon', expr: 'report', class: 'warn' },
      primary: { type: 'text', expr: '${item.descricao}' },
      secondary: { type: 'text', expr: 'Severidade: ${item.severidade} • Local: ${item.local}' },
      meta: { type: 'chip', expr: 'Ocorrido em ${item.ocorridoEm}', class: 'chip-date' },
      sectionHeader: { type: 'text', expr: 'Severidade: ${section.key}', class: 'section-h' },
      features: [
        { icon: 'payments', expr: 'Pago ${item.totalPago}' },
        { icon: 'account_balance_wallet', expr: 'Pendente ${item.totalPendente}' },
        { icon: 'attach_money', expr: 'Danos ${item.danosCivis}' },
      ],
    },
    actions: [
      { id: 'open', icon: 'open_in_new', label: 'Abrir' },
      { id: 'alert', icon: 'warning', label: 'Alerta', showIf: "${item.severidade} == 'CRITICA'" },
    ],
  } satisfies import('@praxisui/list').PraxisListConfig;

  noop(_: any): void {}
  onAction(ev: any): void { try { this.status = `Ação: ${ev?.actionId}`; setTimeout(() => { if (this.status?.startsWith('Ação:')) this.status=''; }, 1500); } catch {} }
  onSelection(ev: any): void { try { this.status = `Selecionado: ${Array.isArray(ev?.ids)? ev.ids.join(','): ev?.ids || ''}`; setTimeout(() => { if (this.status?.startsWith('Selecionado:')) this.status=''; }, 1500); } catch {} }

  // no login CTA button here; login CTA existe nos outros demos (Table/Form)
}
