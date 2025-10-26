import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-componentes-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="stub">
      <h2>Componentes — Showcases</h2>
      <p>Atalhos para demos locais e do workspace (abre em nova aba).</p>

      <h3>Locais (Quickstart)</h3>
      <ul>
        <li>
          <a [routerLink]="['/componentes/table']" [state]="{ resource: '/human-resources/funcionarios' }">
            Tabela (demo) — Funcionários
          </a>
        </li>
        <li>
          <a [routerLink]="['/componentes/form']" [state]="{ resource: '/human-resources/funcionarios', mode: 'create' }">
            Formulário (demo) — Funcionários
          </a>
        </li>
        <li><a routerLink="/heroes/perfis">Perfis (lista)</a></li>
        <li><a routerLink="/heroes/habilidades">Habilidades (lista)</a></li>
        <li><a routerLink="/compliance/indicadores">Indicadores (dashboard)</a></li>
      </ul>

      <h3>Workspace (porta 4003)</h3>
      <ul>
        <li><a href="http://localhost:4003/tabs-demo" target="_blank" rel="noopener">Tabs Demo</a></li>
        <li><a href="http://localhost:4003/expansion-demo" target="_blank" rel="noopener">Expansion Demo</a></li>
        <li><a href="http://localhost:4003/lists-demo" target="_blank" rel="noopener">Lists Demo</a></li>
        <li><a href="http://localhost:4003/lists-remote-demo" target="_blank" rel="noopener">Lists Remote Demo</a></li>
        <li><a href="http://localhost:4003/dialog-demo" target="_blank" rel="noopener">Dialog Demo</a></li>
        <li><a href="http://localhost:4003/stepper-demo" target="_blank" rel="noopener">Stepper Demo</a></li>
        <li><a href="http://localhost:4003/ui-upload-test" target="_blank" rel="noopener">Files Upload</a></li>
        <li><a href="http://localhost:4003/cron-builder-showcase" target="_blank" rel="noopener">Cron Builder</a></li>
        <li><a href="http://localhost:4003/form-preview" target="_blank" rel="noopener">Form Preview</a></li>
        <li><a href="http://localhost:4003/form-config-editor" target="_blank" rel="noopener">Form Config Editor</a></li>
        <li><a href="http://localhost:4003/dynamic-grid-demo" target="_blank" rel="noopener">Dynamic Grid Demo</a></li>
        <li><a href="http://localhost:4003/dynamic-gridster-demo" target="_blank" rel="noopener">Dynamic Gridster Demo</a></li>
        <li><a href="http://localhost:4003/dynamic-page-demo" target="_blank" rel="noopener">Dynamic Page Demo</a></li>
        <li><a href="http://localhost:4003/my-custom-demo" target="_blank" rel="noopener">Custom Components</a></li>
      </ul>
    </section>
  `,
  styles: [`
    .stub { padding: 16px; }
    h2 { margin: 0 0 8px; }
    h3 { margin: 16px 0 6px; }
    ul { margin: 0 0 8px; padding-left: 18px; }
    a { color: #80b0ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class ComponentesPage {}
