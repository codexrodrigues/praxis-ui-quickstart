import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-componentes-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <section class="catalog">
      <header class="head">
        <h2>Componentes</h2>
        <p class="sub">Escolha um showcase para experimentar com sua API.</p>
        <div class="search">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="text" [value]="searchTerm" (input)="onFilter($event)" placeholder="Buscar por nome…" aria-label="Buscar showcase" />
        </div>
      </header>

      <ng-container *ngFor="let g of viewGroups">
        <h3 class="group">{{ g.label }}</h3>
        <div class="grid">
          <ng-container *ngFor="let it of g.items">
            <a *ngIf="it.kind==='internal'"
               class="card"
               [class.disabled]="it.status==='soon'"
               [routerLink]="[it.link]"
               [state]="it.state || null"
               (click)="$event.preventDefault(); it.status!=='soon' && navigate(it)"
               [attr.aria-disabled]="it.status==='soon'">
              <span class="material-symbols-outlined" aria-hidden="true">{{ it.icon || 'widgets' }}</span>
              <div>
                <div class="title">{{ it.title }} <small class="tag" *ngIf="it.status==='soon'">Em breve</small></div>
                <div class="desc">{{ it.desc }}</div>
              </div>
              <span class="lock material-symbols-outlined" *ngIf="it.requiresAuth" aria-hidden="true">lock</span>
            </a>
            <a *ngIf="it.kind==='external'"
               class="card"
               [class.disabled]="it.status==='soon'"
               [href]="it.link || '#'" target="_blank" rel="noopener"
               (click)="it.status==='soon' && $event.preventDefault()"
               [attr.aria-disabled]="it.status==='soon'">
              <span class="material-symbols-outlined" aria-hidden="true">{{ it.icon || 'open_in_new' }}</span>
              <div>
                <div class="title">{{ it.title }} <small class="tag" *ngIf="it.status==='soon'">Em breve</small></div>
                <div class="desc">{{ it.desc }}</div>
              </div>
              <span class="external material-symbols-outlined" aria-hidden="true">open_in_new</span>
            </a>
          </ng-container>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .catalog { padding: 16px; }
    .head h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; letter-spacing: .2px; }
    .head .sub { margin: 0 8px 8px 0; color: var(--text-muted); }
    .head .search { display:flex; align-items:center; gap: 6px; margin-bottom: 12px; }
    .head .search .material-symbols-outlined { font-size: 18px; color: var(--brand-grad-end, #8b5cf6); }
    .head .search input { height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: var(--text-body); padding: 0 8px; width: 100%; }
    .group { margin: 12px 0 8px; font-size: 13px; color: var(--text-subtle); text-transform: uppercase; letter-spacing: .6px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 12px; }
    .card { position: relative; display:flex; gap: 10px; align-items: flex-start; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: inherit; text-decoration: none; }
    .card:hover { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.06); }
    .card.disabled { opacity: .6; cursor: default; }
    .card .material-symbols-outlined { font-size: 22px; color: var(--brand-grad-end, #8b5cf6); }
    .card .title { font-weight: 700; }
    .card .desc { color: var(--text-muted); font-size: 12.5px; }
    .card .tag { margin-left: 6px; font-weight: 600; color: var(--text-muted); }
    .card .lock { position: absolute; right: 10px; top: 10px; font-size: 18px; opacity: .8; }
    .card .external { position: absolute; right: 10px; bottom: 10px; font-size: 18px; opacity: .8; }
  `]
})
export class ComponentesPage {
  private http = inject(HttpClient);
  private router = inject(Router);

  searchTerm = '';
  groups: Array<{ label: string; items: any[] }> = [];
  viewGroups: Array<{ label: string; items: any[] }> = [];

  constructor() {
    this.load();
  }

  private load(): void {
    this.http.get<{ groups: Array<{ label: string; items: any[] }> }>(`/assets/components-catalog.json`).subscribe({
      next: (data) => { this.groups = data?.groups || []; this.applyFilter(); },
      error: () => {
        // Fallback mínimo caso o asset falhe
        this.groups = [
          { label: 'Showcases', items: [
            { id: 'table-demo', title: 'Tabela (demo)', desc: 'Lista gerada por schema', icon: 'table_view', kind: 'internal', link: '/componentes/table', state: { resource: '/human-resources/funcionarios' }, requiresAuth: true, status: 'stable' },
            { id: 'list-demo', title: 'Listas (demo)', desc: 'Listas/cartões com dados reais', icon: 'format_list_bulleted', kind: 'internal', link: '/componentes/list', requiresAuth: true, status: 'stable' },
            { id: 'tabs-demo', title: 'Tabs (demo)', desc: 'Abas com Tabela e Form', icon: 'tab', kind: 'internal', link: '/componentes/tabs', requiresAuth: true, status: 'stable' },
            { id: 'form-demo', title: 'Formulário (demo)', desc: 'Form dinâmico por schema', icon: 'dynamic_form', kind: 'internal', link: '/componentes/form', state: { resource: '/human-resources/funcionarios', mode: 'create' }, requiresAuth: true, status: 'stable' },
          ]}
        ];
        this.applyFilter();
      }
    });
  }

  onFilter(ev: Event): void {
    const v = (ev.target as HTMLInputElement)?.value ?? '';
    this.searchTerm = v;
    this.applyFilter();
  }

  private applyFilter(): void {
    const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(this.searchTerm);
    const groups: Array<{ label: string; items: any[] }> = [];
    for (const g of this.groups) {
      const items = (g.items || []).filter((it: any) => {
        if (!term) return true;
        return norm(it.title).includes(term) || norm(it.desc).includes(term);
      });
      if (items.length) groups.push({ label: g.label, items });
    }
    this.viewGroups = groups;
  }

  navigate(it: any): void {
    try { this.router.navigate([it.link], { state: it.state || null }); } catch {}
  }
}
