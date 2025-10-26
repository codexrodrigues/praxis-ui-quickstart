Praxis UI – Guia de Integração (Angular 20+)
===========================================

Este guia resume, de forma prática, tudo que foi necessário para integrar as libs `@praxisui/*` em um projeto Angular 20+, com foco nos passos, tokens, providers, tema M3, e correções de erros encontrados durante a adoção.

> Testado em Angular 20.x, TypeScript ~5.8, Material 3.

---

1) Dependências essenciais
--------------------------

Instale os pacotes principais (ajuste versões conforme seu workspace):

```
npm i @praxisui/core @praxisui/table @praxisui/crud @praxisui/dynamic-form @praxisui/dynamic-fields @praxisui/dialog @praxisui/settings-panel @praxisui/visual-builder @praxisui/specification @praxisui/specification-core @praxisui/metadata-editor
```

Notas:
- `@praxisui/dynamic-form` referencia `@praxisui/metadata-editor`. Garanta que esteja instalado.
- Alguns builds podem exibir warnings de CommonJS (ex.: cron-builder). Opcionalmente, adicione-os em `allowedCommonJsDependencies` no `angular.json`.

---

2) Providers obrigatórios (app.config.ts)
----------------------------------------

Declare tokens, serviços e metadados do Praxis. Exemplo mínimo:

```
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideGlobalConfigTenant,
  provideGlobalConfigSeed,
  provideRemoteGlobalConfig,
  provideGlobalConfig,
  GenericCrudService,            // importante: não é providedIn: 'root'
  API_URL, type ApiUrlConfig,
} from '@praxisui/core';
import { providePraxisTableMetadata } from '@praxisui/table';
import { providePraxisCrudMetadata, CRUD_DRAWER_ADAPTER } from '@praxisui/crud';
import { FILTER_DRAWER_ADAPTER } from '@praxisui/table';
import { DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { HostCrudDrawerAdapter } from './core/crud-drawer/host-crud-drawer.adapter';
import { HostFilterDrawerAdapter } from './core/filter-drawer/host-filter-drawer.adapter';
import { AppConfigService } from './core/config/app-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })),

    // Serviços essenciais Praxis
    GenericCrudService,
    providePraxisTableMetadata(),
    providePraxisCrudMetadata(),

    // Adaptadores do host
    { provide: CRUD_DRAWER_ADAPTER, useClass: HostCrudDrawerAdapter },
    { provide: FILTER_DRAWER_ADAPTER, useClass: HostFilterDrawerAdapter },

    // Token de API
    { provide: API_URL, deps: [AppConfigService], useFactory: (cfg: AppConfigService): ApiUrlConfig => ({
      default: { baseUrl: cfg.getApiBaseUrl() },
    }) },

    // Pipes usados por formatação do PraxisTable
    DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe,

    // (Opcional) Config global e carregamento remoto
    provideGlobalConfigTenant('tenant-default'),
    provideGlobalConfigSeed({ table: { filteringUi: { advancedOpenMode: 'drawer' } } }),
    provideRemoteGlobalConfig('/assets/global-config.json'),
    provideGlobalConfig({ crud: { defaults: { openMode: 'modal' } } }),

    provideAnimations(),
  ]
};
```

Erros comuns resolvidos:
- NG0201: No provider for `GenericCrudService` → adicionar `GenericCrudService` nos providers.
- NG0201: No provider for `DatePipe` → prover os pipes do Angular utilizados pelo `DataFormattingService`.

---

3) Tema Material 3 (M3) e tokens CSS
-------------------------------------

Os editores do Praxis usam CSS vars `--md-sys-*` (M3). O Angular expõe `--mat-sys-*`. Mapeie-os no `:root` para cores corretas (sem fundo transparente nos editores):

```
// src/styles.scss (trecho)
:root {
  // Alias md-sys → mat-sys (essenciais para editores/painéis)
  --md-sys-color-surface-container: var(--mat-sys-color-surface-container);
  --md-sys-color-surface-container-low: var(--mat-sys-color-surface-container-low);
  --md-sys-color-surface-container-high: var(--mat-sys-color-surface-container-high);
  --md-sys-color-surface-container-highest: var(--mat-sys-color-surface-container-highest);
  --md-sys-color-surface: var(--mat-sys-color-surface);
  --md-sys-color-surface-variant: var(--mat-sys-color-surface-variant);
  --md-sys-color-on-surface: var(--mat-sys-color-on-surface);
  --md-sys-color-on-surface-variant: var(--mat-sys-color-on-surface-variant);
  --md-sys-color-outline: var(--mat-sys-color-outline);
  --md-sys-color-outline-variant: var(--mat-sys-color-outline-variant);
  --md-sys-color-primary: var(--mat-sys-color-primary);
}

// Evita fundo transparente em diálogos (editores)
.mat-mdc-dialog-container .mdc-dialog__surface {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}
.mat-mdc-dialog-container .mdc-dialog__content {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

3.1) Overlays (CDK) e herança de variáveis
-------------------------------------------

O Settings Panel e alguns editores podem ser renderizados em containers de overlay (fora do `app-root`).
Para evitar fundos transparentes quando o overlay não herda as variáveis do `:root`, replique os aliases
no container global do CDK:

```
/* src/styles.scss */
.cdk-overlay-container, .cdk-global-overlay-wrapper {
  --md-sys-color-surface: var(--mat-sys-color-surface, #121212);
  --md-sys-color-surface-variant: var(--mat-sys-color-surface-variant, #2a2f36);
  --md-sys-color-surface-container-lowest: var(--mat-sys-color-surface-container-lowest, #0b0f14);
  --md-sys-color-surface-container-low: var(--mat-sys-color-surface-container-low, #151a20);
  --md-sys-color-surface-container: var(--mat-sys-color-surface-container, #1c1f24);
  --md-sys-color-surface-container-high: var(--mat-sys-color-surface-container-high, #22262c);
  --md-sys-color-surface-container-highest: var(--mat-sys-color-surface-container-highest, #262b31);
  --md-sys-color-on-surface: var(--mat-sys-color-on-surface, #e6ebf2);
  --md-sys-color-on-surface-variant: var(--mat-sys-color-on-surface-variant, #b7bcc6);
  --md-sys-color-outline-variant: var(--mat-sys-color-outline-variant, rgba(255,255,255,0.14));
  --md-sys-color-outline: var(--mat-sys-color-outline, rgba(255,255,255,0.24));

  --md-sys-color-primary: var(--mat-sys-color-primary, #4cc9f0);
  --md-sys-color-secondary: var(--mat-sys-color-secondary, #b39ddb);
  --md-sys-color-tertiary: var(--mat-sys-color-tertiary, #ff8fab);
  --md-sys-color-background: var(--mat-sys-color-background, var(--mat-sys-color-surface, #121212));
}
```

3.2) Pacote de aliases recomendado (com fallbacks)
--------------------------------------------------

Para maior robustez (e para cobrir todos os componentes `@praxisui`), recomenda-se definir no `:root`
um pacote mais completo com fallbacks seguros para tema escuro:

```
/* src/styles.scss */
:root {
  /* Superfícies e contêineres */
  --md-sys-color-surface: var(--mat-sys-color-surface, #121212);
  --md-sys-color-surface-variant: var(--mat-sys-color-surface-variant, #2a2f36);
  --md-sys-color-surface-container-lowest: var(--mat-sys-color-surface-container-lowest, #0b0f14);
  --md-sys-color-surface-container-low: var(--mat-sys-color-surface-container-low, #151a20);
  --md-sys-color-surface-container: var(--mat-sys-color-surface-container, #1c1f24);
  --md-sys-color-surface-container-high: var(--mat-sys-color-surface-container-high, #22262c);
  --md-sys-color-surface-container-highest: var(--mat-sys-color-surface-container-highest, #262b31);
  --md-sys-color-on-surface: var(--mat-sys-color-on-surface, #e6ebf2);
  --md-sys-color-on-surface-variant: var(--mat-sys-color-on-surface-variant, #b7bcc6);
  --md-sys-color-outline-variant: var(--mat-sys-color-outline-variant, rgba(255,255,255,0.14));
  --md-sys-color-outline: var(--mat-sys-color-outline, rgba(255,255,255,0.24));

  /* Paleta e estados */
  --md-sys-color-primary: var(--mat-sys-color-primary, #4cc9f0);
  --md-sys-color-on-primary: var(--mat-sys-color-on-primary, #ffffff);
  --md-sys-color-primary-container: var(--mat-sys-color-primary-container, #0e7aa3);
  --md-sys-color-on-primary-container: var(--mat-sys-color-on-primary-container, #d0f0ff);
  --md-sys-color-secondary: var(--mat-sys-color-secondary, #b39ddb);
  --md-sys-color-on-secondary: var(--mat-sys-color-on-secondary, #1b1327);
  --md-sys-color-secondary-container: var(--mat-sys-color-secondary-container, #3a2c5e);
  --md-sys-color-on-secondary-container: var(--mat-sys-color-on-secondary-container, #e8dcff);
  --md-sys-color-tertiary: var(--mat-sys-color-tertiary, #ff8fab);
  --md-sys-color-tertiary-container: var(--mat-sys-color-tertiary-container, #5a2231);
  --md-sys-color-on-tertiary-container: var(--mat-sys-color-on-tertiary-container, #ffd9e1);
  --md-sys-color-error: var(--mat-sys-color-error, #ffb4ab);
  --md-sys-color-error-container: var(--mat-sys-color-error-container, #8c1d18);
  --md-sys-color-on-error-container: var(--mat-sys-color-on-error-container, #ffdad6);
  --md-sys-color-background: var(--mat-sys-color-background, var(--mat-sys-color-surface, #121212));
}
```

Tokens tipicamente referenciados por `@praxisui` (Settings Panel, Table, editores):
- `--md-sys-color-surface`, `--md-sys-color-surface-variant`
- `--md-sys-color-surface-container(-low|-high|-highest)`
- `--md-sys-color-on-surface`, `--md-sys-color-on-surface-variant`
- `--md-sys-color-outline`, `--md-sys-color-outline-variant`
- `--md-sys-color-primary`, `--md-sys-color-secondary`, `--md-sys-color-tertiary`
- `--md-sys-color-primary-container`, `--md-sys-color-secondary-container`, `--md-sys-color-tertiary-container`
- `--md-sys-color-error`, `--md-sys-color-background`

---

4) Shims de tipos do Angular Material (hashes)
----------------------------------------------

Alguns bundles gerados referenciam módulos d.ts “hash” do Material, ex.: `@angular/material/error-options.d-XXXXX`. Adicione shims locais para destravar a compilação TypeScript:

```
// src/types/material-shims.d.ts
declare module '@angular/material/error-options.d-CGdTZUYk' {
  export type E = any;
}

declare module '@angular/material/paginator.d-Zo1cMMo4' {
  export type M = any;
}
```

> Dica: se os hashes mudarem (outras versões), inclua novos aliases neste arquivo.

---

5) Integrando a Tabela
----------------------

Uso básico:

```
<praxis-table
  [resourcePath]="'/human-resources/funcionarios'"
  [showToolbar]="true"
  [editModeEnabled]="custom.enabled()"
></praxis-table>
```

Backend esperado para um `resourcePath = '/module/resource'`:
- Dados: `GET /api/module/resource/all`
- Filtro: `POST /api/module/resource/filter`
- Schemas (grid): `GET /api/module/resource/schemas` (302 → `/api/schemas/filtered?path=/api/module/resource/all&operation=get&schemaType=response`)

Rotas relativas (`/api`) funcionam em dev (proxy) e produção (host final). Evite hardcode do host para endpoints, exceto para links de documentação (Swagger UI).

---

6) Highlight.js (exibir exemplos de código)
------------------------------------------

- Adicione o tema CSS no `angular.json` (ex.: `node_modules/highlight.js/styles/github-dark.min.css`).
- Provider global com core + linguagens necessárias + line numbers:

```
// src/app/app.config.ts (trecho)
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

{
  provide: HIGHLIGHT_OPTIONS,
  useValue: {
    coreLibraryLoader: () => import('highlight.js/lib/core'),
    languages: {
      typescript: () => import('highlight.js/lib/languages/typescript'),
      xml: () => import('highlight.js/lib/languages/xml'),
      json: () => import('highlight.js/lib/languages/json'),
    },
    lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
  },
},
```

- No componente standalone, importe o diretivo (ou o módulo) para usar `[highlight]`.

Erros comuns resolvidos:
- “Highlight.js library was not imported” → garantir provider e import do diretivo/módulo.
- “Highlighting languages were not imported” → registrar as linguagens usadas em `HIGHLIGHT_OPTIONS.languages`.
- “Can't bind to 'highlight' …” → importar `Highlight` (ou `HighlightModule`) no componente que usa.

---

7) Erros de TypeScript (ex.: interfaces)
----------------------------------------

Evite sintaxes inválidas em interfaces (ex.: `prop!: string;` dentro de `export interface`). Ex.: 

Errado:
```
export interface Ctx {
  resourcePath!: string;
}
```

Correto:
```
export interface Ctx {
  resourcePath: string;
}
```

---

8) Adaptadores / Drawers (host)
--------------------------------

Implemente adaptadores para integrar CRUD/Filter à sua UI (MatDialog / Sidenav). Registre-os nos tokens:

```
{ provide: CRUD_DRAWER_ADAPTER, useClass: HostCrudDrawerAdapter }
{ provide: FILTER_DRAWER_ADAPTER, useClass: HostFilterDrawerAdapter }
```

Os componentes Praxis detectam esses adaptadores para abrir painéis (ex.: filtro avançado em drawer).

---

9) Extras de tema (opcional)
----------------------------

- Gradientes brand:
  - Variáveis: `--brand-grad-start`, `--brand-grad-end`.
  - Borda em gradiente via `.gradient-border` (usa máscara para preservar bordas arredondadas).
- Botão primário gradiente:
  - Classe Material: `.mat-mdc-unelevated-button.mat-primary` (e raised/FAB) com `background-image: linear-gradient(...)`.

Esses ajustes são opcionais (estéticos) e não impactam a funcionalidade das libs.

---

10) Checklist de integração
---------------------------

- [ ] Pacotes instalados (incluindo `@praxisui/metadata-editor`)
- [ ] Providers configurados (API_URL, GenericCrudService, providePraxis*Metadata)
- [ ] Adaptadores de drawers registrados
- [ ] Pipes de formatação (Date/Number/Currency/Percent/String) providos
- [ ] Tema M3 ativo e tokens md-sys mapeados para mat-sys
- [ ] MatDialog com superfícies definidas (sem transparência)
- [ ] (Se usar highlight) HIGHLIGHT_OPTIONS + tema CSS + import do diretivo
- [ ] Rota `/api` configurada (proxy em dev) e endpoints implementados no backend

---

11) FAQ de erros
----------------

- NG0201: No provider for `GenericCrudService`
  - Adicione `GenericCrudService` nos `providers` do app.

- NG0201: No provider for `DatePipe` (ou Decimal/Currency/Percent)
  - Providencie os Pipes em `app.config.ts`.

- “Module not found: Can't resolve '@praxisui/metadata-editor'”
  - Instale `@praxisui/metadata-editor` (o `@praxisui/dynamic-form` depende).

- “Can't bind to 'highlight' …” / “Highlight.js library was not imported”
  - Importe o diretivo `Highlight` e configure `HIGHLIGHT_OPTIONS` com linguagens.

- Erros em d.ts do Material com módulos hash
  - Adicione `src/types/material-shims.d.ts` com os aliases necessários.

- Fundo transparente nos editores (SettingsPanel / editores de config)
  - Mapeie `--md-sys-*` → `--mat-sys-*` e force superfícies do MatDialog via CSS.

---

12) Exemplo de uso da Tabela (mínimo)
-------------------------------------

```
// src/app/features/example/table.page.ts
import { Component } from '@angular/core';
import { PraxisTable } from '@praxisui/table';

@Component({
  standalone: true,
  selector: 'app-table-page',
  imports: [PraxisTable],
  template: `
    <praxis-table
      [resourcePath]="'/human-resources/funcionarios'"
      [showToolbar]="true"
      [editModeEnabled]="true"
    />
  `,
})
export class TablePage {}
```

---

Se precisar, podemos evoluir este guia para um “cookbook” (ex.: CRUD completo, filtros avançados, personalização da toolbar e integração com hooks de formulário).
