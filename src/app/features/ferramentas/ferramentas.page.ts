import { Component } from '@angular/core';

@Component({
  selector: 'app-ferramentas-page',
  standalone: true,
  template: `
    <section class="stub">
      <h2>Ferramentas — Showcases</h2>
      <p>Atalhos para editores, regras e utilitários do workspace (abre em nova aba).</p>

      <h3>Workspace (porta 4003)</h3>
      <ul>
        <li><a href="http://localhost:4003/table-rules" target="_blank" rel="noopener">Table Rules — Index</a></li>
        <li><a href="http://localhost:4003/table-rules-simple" target="_blank" rel="noopener">Table Rules — Simple</a></li>
        <li><a href="http://localhost:4003/table-rules-complex" target="_blank" rel="noopener">Table Rules — Complex</a></li>
        <li><a href="http://localhost:4003/dialog-demo" target="_blank" rel="noopener">Dialogs</a></li>
        <li><a href="http://localhost:4003/cron-builder-showcase" target="_blank" rel="noopener">Cron Builder</a></li>
        <li><a href="http://localhost:4003/ui-wrappers-test" target="_blank" rel="noopener">UI Wrappers Test</a></li>
      </ul>

      <h3>Docs</h3>
      <ul>
        <li><a href="/assets/app-config.json" target="_blank" rel="noopener">App Config — Dev</a></li>
        <li><a href="/assets/app-config.prod.json" target="_blank" rel="noopener">App Config — Prod</a></li>
        <li><a href="https://praxis-api-quickstart.onrender.com/swagger-ui/index.html" target="_blank" rel="noopener">Swagger/OpenAPI</a></li>
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
export class FerramentasPage {}

