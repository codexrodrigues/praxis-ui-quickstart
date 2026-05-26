import type { CrudMetadata } from '@praxisui/crud';
import type { PraxisChartConfig, PraxisXUiChartContract } from '@praxisui/charts';
import type { EditorialRuntimeInput } from '@praxisui/editorial-forms';
import type { ExpansionMetadata } from '@praxisui/expansion';
import type { FormConfig, SurfaceOpenPayload, TableConfig } from '@praxisui/core';
import type { PraxisListConfig } from '@praxisui/list';
import type { StepperMetadata } from '@praxisui/stepper';
import type { TabsMetadata } from '@praxisui/tabs';
import { PRAXIS_API_BASE_URL } from './quickstart-platform-config';

export interface SetupStep {
  readonly title: string;
  readonly detail: string;
}

export interface CatalogLink {
  readonly title: string;
  readonly route: string;
  readonly icon: string;
  readonly description: string;
}

export interface ThemeOwnershipPoint {
  readonly title: string;
  readonly detail: string;
}

export interface PositioningPanel {
  readonly eyebrow: string;
  readonly title: string;
  readonly detail: string;
  readonly bullets: readonly string[];
}

export { GLOBAL_CONFIG_SEED, PRAXIS_API_BASE_URL, PRAXIS_API_ORIGIN } from './quickstart-platform-config';
export const QUICKSTART_RESOURCE_PATH = 'human-resources/funcionarios';
export const QUICKSTART_PAYROLL_RESOURCE_PATH = 'human-resources/folhas-pagamento';
export const QUICKSTART_PAYROLL_ANALYTICS_RESOURCE_PATH = 'human-resources/vw-analytics-folha-pagamento';
export const QUICKSTART_MISSION_PARTICIPANTS_RESOURCE_PATH = 'operations/missao-participantes';
export const QUICKSTART_FORM_ID = 'quickstart-funcionarios';
export const QUICKSTART_CRUD_ID = 'quickstart-crud';
export const QUICKSTART_LIST_ID = 'quickstart-list';
export const QUICKSTART_MANUAL_FORM_ID = 'quickstart-manual-form';
export const QUICKSTART_TABS_ID = 'quickstart-tabs';
export const QUICKSTART_STEPPER_ID = 'quickstart-stepper';
export const QUICKSTART_EXPANSION_ID = 'quickstart-expansion';

export const HERO_PILLS = [
  'Angular 20 standalone',
  'Public PraxisUI beta',
  'Published API on Render',
  'Metadata-driven examples',
] as const;

export const HERO_FACTS = [
  'Angular 20 host pinned to the compatible PraxisUI beta train',
  '4 core runtimes proving one published resource contract',
  'Composition examples for guided flows, charts, and editorial blocks',
  'Runtime customization toggle owned by the host shell',
  'Clear bridge to praxisui.dev, metadata starter, and config starter',
] as const;

export const HOME_INTRO = {
  title: 'Use this repo as the minimal public Angular host for PraxisUI adoption.',
  eyebrow: 'Quickstart host for metadata-driven UI, runtime composition, and public API integration.',
};

export const CORE_CATALOG_LINKS: readonly CatalogLink[] = [
  {
    title: 'Praxis Table',
    route: '/examples/table',
    icon: 'table_rows',
    description: 'Browse remote rows from the published API and prove the canonical runtime path first.',
  },
  {
    title: 'Praxis Dynamic Form',
    route: '/examples/form',
    icon: 'edit_note',
    description: 'Submit a remote form against the same resource and confirm metadata-driven behavior end to end.',
  },
  {
    title: 'Praxis CRUD',
    route: '/examples/crud',
    icon: 'inventory_2',
    description: 'Connect table and form in a governed CRUD flow without introducing a second screen stack.',
  },
  {
    title: 'Praxis List',
    route: '/examples/list',
    icon: 'view_stream',
    description: 'Render the same resource in a list-oriented runtime to prove reuse of the published backend surface.',
  },
] as const;

export const ADVANCED_CATALOG_LINKS: readonly CatalogLink[] = [
  {
    title: 'Praxis Manual Form',
    route: '/examples/manual-form',
    icon: 'dashboard_customize',
    description: 'Use Praxis fields inside a host-owned layout when schema-driven rendering is not the whole screen.',
  },
  {
    title: 'Praxis Tabs',
    route: '/examples/tabs',
    icon: 'tabs',
    description: 'Compose charts and editorial runtime blocks into focused views without building a tab shell.',
  },
  {
    title: 'Praxis Stepper',
    route: '/examples/stepper',
    icon: 'checklist',
    description: 'Guide multi-step data capture with metadata-backed forms and predictable navigation.',
  },
  {
    title: 'Praxis Expansion',
    route: '/examples/expansion',
    icon: 'expand_content',
    description: 'Group charts, narrative guidance, and operational signals into scannable panels.',
  },
];

export const SETUP_STEPS: readonly SetupStep[] = [
  {
    title: 'Install the Angular 20 beta train',
    detail:
      'Use the pinned @praxisui/* 8.0.0-beta.28 packages so npm does not resolve peers from the Angular 21 train.',
  },
  {
    title: 'Configure the host correctly',
    detail:
      'Register API_URL, table pipes, dynamic-fields providers, and the headers factory before the first remote flow.',
  },
  {
    title: 'Render a real flow',
    detail:
      'Table, form, CRUD, and list should consume the same published resourcePath to show the platform working for real.',
  },
  {
    title: 'Expand only after the first proof',
    detail:
      'Use manual form, tabs, stepper, expansion, charts, and editorial runtime after the primary resource path is proven.',
  },
  {
    title: 'Test runtime customization',
    detail:
      'Toggle customization mode to confirm that supported runtimes can expose editor affordances without changing host wiring.',
  },
  {
    title: 'Keep ownership in the host',
    detail:
      'Let Praxis resolve runtime behavior while your Angular host keeps control of tokens, typography, spacing, and brand identity.',
  },
] as const;

export const THEME_OWNERSHIP_POINTS: readonly ThemeOwnershipPoint[] = [
  {
    title: 'Shared runtime, local brand',
    detail: 'Praxis owns runtime behavior. Your host still owns colors, typography, spacing, and density.',
  },
  {
    title: 'No proprietary skin',
    detail: 'The quickstart proves adoption on top of a host visual system instead of asking teams to accept a fixed Praxis look or an Angular-default aesthetic.',
  },
  {
    title: 'Design-system friendly',
    detail: 'The radical Corporate theme intentionally pushes gradients, larger radii, glass surfaces, and SaaS-like chrome to prove the host can reshape the visual language without changing the Praxis runtime.',
  },
] as const;

export const POSITIONING_PANELS: readonly PositioningPanel[] = [
  {
    eyebrow: 'Quickstart role',
    title: 'This repo proves host integration, not the whole platform catalog.',
    detail:
      'The quickstart starts with human-resources/funcionarios to keep onboarding stable, then shows enough composition and customization to prove the runtime model.',
    bullets: [
      'Table, form, CRUD, and list all reuse the same published resourcePath.',
      'Manual form, tabs, stepper, and expansion demonstrate where the runtime goes after the first proof.',
      'Broader component documentation, recipes, and playgrounds live on praxisui.dev.',
    ],
  },
  {
    eyebrow: 'Platform relationship',
    title: 'The quickstart consumes canonical contracts; it does not define them.',
    detail:
      'Use this repository to verify the Angular host path while keeping contract ownership in the platform projects that publish the semantics.',
    bullets: [
      'praxis-metadata-starter owns resource semantics and x-ui contracts.',
      'praxis-config-starter owns runtime configuration, AI registry, and authoring state.',
      'praxisui.dev is the public narrative for examples, docs, and playgrounds.',
    ],
  },
] as const;

export const INSTALL_COMMAND = `npm install \\
  @angular/animations@^20.3.18 @angular/cdk@^20.1.4 @angular/material@^20.1.4 \\
  @angular/platform-browser-dynamic@^20.3.0 \\
  @praxisui/ai@8.0.0-beta.28 @praxisui/core@8.0.0-beta.28 \\
  @praxisui/charts@8.0.0-beta.28 @praxisui/crud@8.0.0-beta.28 \\
  @praxisui/dynamic-fields@8.0.0-beta.28 @praxisui/dynamic-form@8.0.0-beta.28 \\
  @praxisui/editorial-forms@8.0.0-beta.28 @praxisui/list@8.0.0-beta.28 \\
  @praxisui/manual-form@8.0.0-beta.28 @praxisui/table@8.0.0-beta.28 \\
  @praxisui/tabs@8.0.0-beta.28 @praxisui/stepper@8.0.0-beta.28 \\
  @praxisui/expansion@8.0.0-beta.28`;

export const BOOTSTRAP_SNIPPET = `const API_URL_VALUE = {
  default: { baseUrl: '${PRAXIS_API_BASE_URL}' },
};

provideHttpClient(withPraxisHttpLoading()),
...providePraxisDynamicFieldsCore(),
{ provide: API_URL, useValue: API_URL_VALUE },
provideEnvironmentInitializer(() => () => {
  (globalThis as any).PAX_FETCH_HEADERS = () => ({
    'X-Tenant-ID': 'demo',
    'X-Tenant': 'demo',
    'Accept-Language': navigator.language || 'en-US',
  });
}),`;

export const TEMPLATE_SNIPPET = `<praxis-table
  tableId="quickstart-table"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'"
  [config]="tableConfig">
</praxis-table>

<praxis-dynamic-form
  [formId]="'${QUICKSTART_FORM_ID}'"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'"
  [mode]="'create'">
</praxis-dynamic-form>`;

export const TABLE_SNIPPET = `<praxis-table
  tableId="quickstart-table"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'">
</praxis-table>`;

export const TABLE_FILTERS_SNIPPET = `<praxis-table
  tableId="quickstart-table-filters"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'"
  [config]="tableFiltersConfig">
</praxis-table>`;

export const TABLE_ACTIONS_SNIPPET = `<praxis-table
  tableId="quickstart-table-surfaces-icons"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'"
  [config]="tableActionsConfig"
  (rowAction)="openBackendSurface($event)">
</praxis-table>

const tableActionsConfig = {
  actions: {
    row: {
      display: 'icons',
      width: '152px',
      header: {
        icon: 'hub',
        tooltip: 'Acoes e surfaces relacionadas ao item',
        align: 'center'
      },
      maxVisibleActions: 3,
      actions: [
        {
          id: 'hero-profile',
          action: 'hero-profile',
          label: 'Perfil 360',
          icon: 'account_circle'
        },
        {
          id: 'employee-payroll-surface',
          label: 'Folha',
          icon: 'payments',
          globalAction: {
            actionId: 'surface.open',
            payload: EMPLOYEE_PAYROLL_SURFACE_PAYLOAD
          }
        },
        {
          id: 'employee-missions-relation',
          label: 'Missoes',
          icon: 'flag',
          globalAction: {
            actionId: 'surface.open',
            payload: EMPLOYEE_MISSIONS_SURFACE_PAYLOAD
          }
        }
      ]
    }
  }
};`;

export const FORM_SNIPPET = `<praxis-dynamic-form
  [formId]="'${QUICKSTART_FORM_ID}'"
  [resourcePath]="'${QUICKSTART_RESOURCE_PATH}'"
  [mode]="'create'">
</praxis-dynamic-form>`;

export const CRUD_SNIPPET = `<praxis-crud
  [crudId]="'${QUICKSTART_CRUD_ID}'"
  [metadata]="crudMetadata">
</praxis-crud>`;

export const LIST_SNIPPET = `<praxis-list
  listId="${QUICKSTART_LIST_ID}"
  [config]="listConfig">
</praxis-list>`;

export const MANUAL_FORM_SNIPPET = `<praxis-manual-form [formGroup]="form" formId="${QUICKSTART_MANUAL_FORM_ID}">
  <section class="profile-hero">
    <pdx-text-input formControlName="name" label="Name"></pdx-text-input>
    <pdx-material-textarea formControlName="summary" label="Summary"></pdx-material-textarea>
  </section>

  <section class="profile-details">
    <pdx-material-select formControlName="department" [metadata]="departmentMetadata"></pdx-material-select>
    <pdx-material-datepicker formControlName="startDate" [metadata]="startDateMetadata"></pdx-material-datepicker>
    <pdx-material-currency formControlName="salary" label="Salary"></pdx-material-currency>
    <pdx-text-input formControlName="location" label="Location"></pdx-text-input>
  </section>
</praxis-manual-form>`;

export const TABS_SNIPPET = `<praxis-tabs
  [tabsId]="'${QUICKSTART_TABS_ID}'"
  [config]="tabsConfig">
</praxis-tabs>`;

export const STEPPER_SNIPPET = `<praxis-stepper
  stepperId="${QUICKSTART_STEPPER_ID}"
  [config]="stepperConfig">
</praxis-stepper>`;

export const EXPANSION_SNIPPET = `<praxis-expansion
  expansionId="${QUICKSTART_EXPANSION_ID}"
  [config]="expansionConfig">
</praxis-expansion>`;

export const TABLE_CONFIG: TableConfig = {
  localization: {
    locale: 'en-US',
    currency: {
      code: 'USD',
      symbol: '$',
    },
  },
} as unknown as TableConfig;

export const TABLE_DYNAMIC_FILTERS_CONFIG: TableConfig = {
  columns: [],
  toolbar: {
    visible: true,
    position: 'top',
    actionsPosition: 'top',
    title: 'Funcionarios',
    subtitle: 'Filtros dinÃ¢micos derivados do FilterDTO publicado pelo backend',
    layout: {
      alignment: 'space-between',
      showSeparator: true,
    },
  },
  behavior: {
    filtering: {
      enabled: true,
      strategy: 'server',
      debounceTime: 300,
      advancedFilters: {
        enabled: true,
        queryBuilder: false,
        savePresets: true,
        settings: {
          alwaysVisibleFields: ['nomeCompleto', 'ativo', 'cpf', 'email'],
          selectedFieldIds: ['telefone'],
          changeDebounceMs: 300,
          mode: 'filter',
          placeBooleansInActions: true,
          showToggleLabels: true,
          alwaysMinWidth: 220,
          alwaysColsMd: 2,
          alwaysColsLg: 4,
          tagColor: 'primary',
          tagVariant: 'outlined',
          actionsButtonColor: 'primary',
          actionsVariant: 'outlined',
          advancedOpenMode: 'drawer',
          overlayVariant: 'frosted',
        },
      },
    },
  },
  localization: {
    locale: 'en-US',
    currency: {
      code: 'USD',
      symbol: '$',
    },
  },
} as unknown as TableConfig;

const relatedSurfacePayloadBase = {
  presentation: 'modal',
  size: {
    width: '1040px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 48px)',
  },
} as const;

const EMPLOYEE_PAYROLL_CHART_DOCUMENT: PraxisXUiChartContract = {
  version: '1.0.0',
  chartId: 'quickstart-employee-payroll-chart',
  kind: 'line',
  preset: 'kpi-trend',
  title: 'Folha liquida por competencia',
  subtitle: 'Historico recente da pessoa selecionada',
  sizing: {
    mode: 'fixed',
    height: 360,
  },
  source: {
    kind: 'praxis.stats',
    resource: QUICKSTART_PAYROLL_ANALYTICS_RESOURCE_PATH,
    operation: 'timeseries',
    options: {
      granularity: 'month',
      fillGaps: true,
      orderBy: 'key-asc',
      limit: 12,
    },
  },
  limit: 12,
  dimensions: [
    {
      field: 'competencia',
      label: 'Competencia',
      role: 'time',
      format: 'month-year',
    },
  ],
  metrics: [
    {
      field: 'salarioLiquido',
      label: 'Salario liquido',
      aggregation: 'sum',
      seriesKind: 'line',
      format: 'USD|symbol|0|compact',
      color: '#1f6feb',
    },
  ],
  legend: false,
  labels: false,
  tooltip: true,
  theme: { variant: 'executive' },
  motion: { enabled: true, preset: 'subtle' },
  state: {
    empty: {
      title: 'Sem dados de folha',
      description: 'Nenhum historico de folha foi publicado para a pessoa selecionada.',
    },
    error: {
      title: 'Falha ao carregar analytics',
      description: 'Confira se o recurso analytics de folha esta disponivel na API publicada.',
    },
  },
};

const EMPLOYEE_PAYROLL_CHART_CONFIG: PraxisChartConfig = {
  id: 'quickstart-employee-payroll-chart',
  type: 'line',
  title: 'Folha liquida por competencia',
  subtitle: 'Historico recente da pessoa selecionada',
  sizing: {
    mode: 'fixed',
    height: 360,
  },
  axes: {
    x: {
      field: 'competencia',
      label: 'Competencia',
      type: 'category',
      labels: {
        rotate: 25,
      },
    },
    y: {
      label: 'Salario liquido',
      type: 'value',
      labels: {
        format: 'USD|symbol|0|compact',
      },
    },
  },
  series: [
    {
      id: 'salarioLiquido',
      name: 'Salario liquido',
      type: 'line',
      metric: {
        field: 'salarioLiquido',
        aggregation: 'sum',
      },
      color: '#1f6feb',
      smooth: true,
      labels: {
        visible: false,
        format: 'USD|symbol|0|compact',
      },
    },
  ],
  theme: {
    tooltip: {
      enabled: true,
      trigger: 'axis',
    },
  },
  emptyState: {
    title: 'Sem dados de folha',
    description: 'Nenhum historico de folha foi publicado para a pessoa selecionada.',
  },
};

const EMPLOYEE_PAYROLL_SURFACE_PAYLOAD: SurfaceOpenPayload = {
  ...relatedSurfacePayloadBase,
  title: 'Analytics de folha',
  subtitle:
    'Payroll analytics rendered by Praxis Chart from a declarative x-ui.chart contract.',
  icon: 'payments',
  size: { width: '1040px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)' },
  widget: {
    id: 'praxis-chart',
    bindingOrder: ['config', 'chartDocument', 'queryContext', 'enableCustomization'],
    inputs: {
      config: EMPLOYEE_PAYROLL_CHART_CONFIG,
      chartDocument: EMPLOYEE_PAYROLL_CHART_DOCUMENT,
      queryContext: {
        filters: {},
        limit: 12,
      },
      enableCustomization: false,
    },
  },
  bindings: [
    { from: 'payload.row.id', to: 'widget.inputs.queryContext.filters.funcionarioId' },
    {
      mode: 'template',
      value: 'Folha de ${payload.row.nomeCompleto}',
      to: 'title',
    },
    {
      mode: 'template',
      value: 'Recent payroll cycles rendered from declarative chart config.',
      to: 'subtitle',
    },
    {
      mode: 'template',
      value: 'Competencias de ${payload.row.nomeCompleto}',
      to: 'widget.inputs.chartDocument.subtitle',
    },
  ],
};

const EMPLOYEE_MISSIONS_SURFACE_PAYLOAD: SurfaceOpenPayload = {
  ...relatedSurfacePayloadBase,
  title: 'Missoes do funcionario',
  subtitle:
    'Participacoes operacionais da pessoa selecionada.',
  icon: 'flag',
  widget: {
    id: 'praxis-table',
    bindingOrder: [
      'resourcePath',
      'tableId',
      'componentInstanceId',
      'queryContext',
      'title',
      'subtitle',
      'icon',
      'config',
      'enableCustomization',
    ],
    inputs: {
      resourcePath: QUICKSTART_MISSION_PARTICIPANTS_RESOURCE_PATH,
      tableId: 'quickstart-employee-missions-surface',
      componentInstanceId: 'quickstart-employee-missions-surface',
      title: 'Missoes',
      subtitle: 'Participacoes operacionais do funcionario selecionado',
      icon: 'flag',
      queryContext: {
        filters: {},
      },
      config: {
        columns: [
          { field: 'missaoTitulo', header: 'Missao', width: '240px' },
          { field: 'papel', header: 'Papel', width: '160px' },
          { field: 'ordem', header: 'Ordem', width: '96px' },
          { field: 'principal', header: 'Principal', type: 'boolean', width: '120px' },
          { field: 'resultado', header: 'Resultado', width: '180px' },
        ],
        pagination: {
          enabled: true,
          pageSize: 8,
          pageSizeOptions: [8, 16, 32],
        },
        appearance: {
          density: 'comfortable',
        },
      },
      enableCustomization: false,
    },
  },
  bindings: [
    { from: 'payload.row.id', to: 'widget.inputs.queryContext.filters.funcionarioId' },
    {
      mode: 'template',
      value: 'Missoes de ${payload.row.nomeCompleto}',
      to: 'title',
    },
    {
      mode: 'template',
      value: 'Missoes relacionadas a ${payload.row.nomeCompleto}.',
      to: 'subtitle',
    },
    {
      mode: 'template',
      value: 'Participacoes de ${payload.row.nomeCompleto}',
      to: 'widget.inputs.subtitle',
    },
    {
      mode: 'template',
      value: 'quickstart-missions-${payload.row.id}',
      to: 'widget.inputs.componentInstanceId',
    },
  ],
};

export const TABLE_RELATED_SURFACES_CONFIG: TableConfig = {
  columns: [],
  toolbar: {
    visible: true,
    position: 'top',
    actionsPosition: 'top',
    title: 'Employees with related surfaces',
    subtitle: 'Row actions open a backend 360 profile, payroll analytics, and operational relations',
    layout: {
      alignment: 'space-between',
      showSeparator: true,
    },
  },
  behavior: {
    sorting: {
      enabled: true,
      strategy: 'server',
      defaultSort: { column: 'id', direction: 'asc' },
    },
    selection: {
      enabled: true,
      type: 'multiple',
      mode: 'checkbox',
      allowSelectAll: true,
      checkboxPosition: 'start',
      persistSelection: false,
      persistOnDataUpdate: false,
      visual: {
        highlightSelected: true,
        showSelectionCount: true,
      },
    },
  },
  actions: {
    row: {
      enabled: true,
      position: 'end',
      width: '152px',
      sticky: 'end',
      display: 'icons',
      trigger: 'always',
      menuIcon: 'more_vert',
      discovery: {
        enabled: true,
      },
      header: {
        icon: 'hub',
        tooltip: 'Actions and related surfaces',
        align: 'center',
      },
      maxVisibleActions: 3,
      behavior: {
        enabled: true,
        maxInline: 3,
        autoStrategy: 'breakpoints',
      },
      actions: [
        {
          id: 'hero-profile',
          action: 'hero-profile',
          label: 'Perfil 360',
          icon: 'account_circle',
          color: 'primary',
          tooltip: 'Open the backend-published Perfil 360 surface',
        },
        {
          id: 'employee-payroll-surface',
          label: 'Folha',
          icon: 'payments',
          color: 'accent',
          tooltip: 'Open payroll analytics for the selected employee',
          globalAction: {
            actionId: 'surface.open',
            payload: EMPLOYEE_PAYROLL_SURFACE_PAYLOAD,
          },
        },
        {
          id: 'employee-missions-relation',
          label: 'Missoes',
          icon: 'flag',
          color: 'accent',
          tooltip: 'Open mission participation filtered by the selected employee',
          globalAction: {
            actionId: 'surface.open',
            payload: EMPLOYEE_MISSIONS_SURFACE_PAYLOAD,
          },
        },
      ],
    },
  },
  localization: {
    locale: 'en-US',
    currency: {
      code: 'USD',
      symbol: '$',
    },
  },
} as unknown as TableConfig;

export const CRUD_METADATA: CrudMetadata = {
  component: 'praxis-crud',
  resource: {
    path: QUICKSTART_RESOURCE_PATH,
    idField: 'id',
  },
  table: {
    columns: [],
  } as unknown as CrudMetadata['table'],
  actions: [
    {
      id: 'edit',
      label: 'Edit',
      action: 'edit',
      openMode: 'modal',
      formId: 'funcionarios-edit',
      params: [{ from: 'id', to: 'input', name: 'id' }],
    },
    {
      id: 'create',
      label: 'New employee',
      action: 'create',
      openMode: 'modal',
      formId: 'funcionarios-create',
    },
  ],
  defaults: {
    openMode: 'modal',
    modal: { width: '880px', maxWidth: '95vw' },
  },
};

export const LIST_CONFIG: PraxisListConfig = {
  dataSource: {
    resourcePath: QUICKSTART_RESOURCE_PATH,
    sort: ['nomeCompleto,asc'],
  },
  layout: {
    variant: 'list',
    density: 'comfortable',
    itemSpacing: 'relaxed',
    lines: 2,
    dividers: 'between',
    pageSize: 6,
  },
  templating: {
    leading: { type: 'icon', expr: 'person' },
    primary: { type: 'text', expr: '${item.nomeCompleto}' },
    secondary: { type: 'text', expr: '${item.cargoNome}' },
    meta: { type: 'text', expr: '${item.email}' },
    metaPrefixIcon: 'mail',
    chipColorMap: {
      active: 'primary',
      inactive: 'warn',
    },
    trailing: { type: 'chip', expr: '${item.ativo}|bool:Active:Inactive' },
  },
  i18n: { locale: 'en-US', currency: 'USD' } as PraxisListConfig['i18n'],
};

export const QUICKSTART_EDITORIAL_RUNTIME_INPUT: EditorialRuntimeInput = {
  solution: {
    solutionId: 'quickstart-editorial-runtime',
    version: '1.0.0',
    problemType: 'editorial-guidance',
    title: 'Keep narrative context close to the workflow.',
    journeys: [
      {
        journeyId: 'quickstart-editorial-journey',
        label: 'Editorial story',
        steps: [
          {
            stepId: 'editorial-overview',
            label: 'Story overview',
            blocks: [
              {
                blockId: 'hero',
                kind: 'introHero',
                align: 'left',
                icon: { name: 'auto_stories' },
                title: 'Use semantic blocks when the experience needs more than raw fields.',
                subtitle: 'Keep the workflow in Angular and add guided context only where it helps the user.',
                description:
                  'Editorial runtime is useful when your screen needs narrative structure, decision support, and product-style sections.',
                highlightItems: [
                  {
                    id: 'focus-1',
                    title: 'Context first',
                    description: 'Frame the user task before asking for action.',
                  },
                  {
                    id: 'focus-2',
                    title: 'Stable runtime',
                    description: 'Resolve sections from structured context instead of hardcoding every card.',
                  },
                ],
              },
              {
                blockId: 'review',
                kind: 'reviewSections',
                title: 'What this pattern can communicate',
                description: 'Use review-style sections to keep product guidance readable and structured.',
                sections: [
                  {
                    id: 'section-layout',
                    title: 'Layout freedom',
                    icon: { name: 'dashboard_customize' },
                    fields: [
                      {
                        key: 'layout',
                        label: 'Host layout',
                        valuePath: 'formData.layoutFreedom',
                      },
                      {
                        key: 'runtime',
                        label: 'Runtime editing',
                        valuePath: 'formData.runtimeEditing',
                      },
                    ],
                  },
                  {
                    id: 'section-coverage',
                    title: 'What teams can mix in',
                    icon: { name: 'extension' },
                    fields: [
                      {
                        key: 'surface',
                        label: 'Shared surface',
                        valuePath: 'formData.sharedSurface',
                      },
                      {
                        key: 'patterns',
                        label: 'Patterns',
                        valuePath: 'formData.patterns',
                        format: 'list',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  instance: {
    instanceId: 'quickstart-editorial-instance',
    template: {
      templateId: 'quickstart-editorial-runtime',
      version: '1.0.0',
      title: 'Quickstart editorial runtime',
      problemType: 'editorial-guidance',
    },
    context: {},
    journeys: [],
  },
  runtimeContext: {
    formData: {
      layoutFreedom: 'Keep your own HTML structure and product composition.',
      runtimeEditing: 'Turn customization on when the runtime needs to evolve.',
      sharedSurface: 'Charts, tabs, expansion panels, and guided copy can coexist.',
      patterns: ['Context cards', 'Review sections', 'Decision support'],
    },
  },
};

export const TABS_OVERVIEW_CHART_CONFIG: PraxisChartConfig = {
  id: 'quickstart-tabs-overview-chart',
  title: 'Adoption by team',
  subtitle: 'Use tabs to separate analytics from narrative support.',
  type: 'bar',
  theme: {
    palette: ['#1263b4', '#0f766e', '#f08c00', '#c92a2a'],
  },
  dataSource: {
    kind: 'local',
    items: [
      { team: 'Design', adoption: 86 },
      { team: 'Product', adoption: 79 },
      { team: 'Operations', adoption: 67 },
      { team: 'HR', adoption: 58 },
    ],
  },
  axes: {
    x: {
      field: 'team',
      type: 'category',
      label: 'Team',
    },
    y: {
      field: 'adoption',
      type: 'value',
      label: 'Adoption',
    },
  },
  series: [
    {
      id: 'adoption',
      type: 'bar',
      metric: {
        field: 'adoption',
        aggregation: 'sum',
      },
      name: 'Adoption',
    },
  ],
};

export const TABS_READINESS_CHART_CONFIG: PraxisChartConfig = {
  id: 'quickstart-tabs-readiness-chart',
  title: 'Launch readiness over time',
  subtitle: 'Keep trend analysis in a dedicated tab instead of crowding the main view.',
  type: 'line',
  theme: {
    palette: ['#1263b4', '#0f766e', '#f08c00', '#c92a2a'],
  },
  dataSource: {
    kind: 'local',
    items: [
      { sprint: 'Sprint 1', readiness: 42 },
      { sprint: 'Sprint 2', readiness: 61 },
      { sprint: 'Sprint 3', readiness: 76 },
      { sprint: 'Sprint 4', readiness: 89 },
    ],
  },
  axes: {
    x: {
      field: 'sprint',
      type: 'category',
      label: 'Sprint',
    },
    y: {
      field: 'readiness',
      type: 'value',
      label: 'Readiness',
    },
  },
  series: [
    {
      id: 'readiness',
      type: 'line',
      metric: {
        field: 'readiness',
        aggregation: 'sum',
      },
      name: 'Readiness',
    },
  ],
};

export function buildTabsShowcaseConfig(
  theme: 'default' | 'corporate' | 'high-contrast' = 'default'
): TabsMetadata {
  const paletteByTheme: Record<'default' | 'corporate' | 'high-contrast', string[]> = {
    default: ['#1263b4', '#0f766e', '#f08c00', '#c92a2a'],
    corporate: ['#7dd3fc', '#34d399', '#a78bfa', '#f59e0b'],
    'high-contrast': ['#003fef', '#005b2e', '#081018', '#7a1cff'],
  };

  const chartPalette = paletteByTheme[theme];

  return {
    behavior: {
      lazyLoad: true,
    },
    group: {
      selectedIndex: 0,
      dynamicHeight: true,
      stretchTabs: false,
    },
    tabs: [
      {
        id: 'overview',
        textLabel: 'Overview',
        widgets: [
          {
              id: 'praxis-chart',
              inputs: {
                config: {
                  ...TABS_OVERVIEW_CHART_CONFIG,
                  theme: { palette: chartPalette },
                },
              },
            },
        ],
      },
      {
        id: 'story',
        textLabel: 'Story',
        widgets: [
          {
            id: 'quickstart-editorial-runtime',
            inputs: {
              input: QUICKSTART_EDITORIAL_RUNTIME_INPUT,
            },
          },
        ],
      },
      {
        id: 'signals',
        textLabel: 'Signals',
        widgets: [
          {
              id: 'praxis-chart',
              inputs: {
                config: {
                  ...TABS_READINESS_CHART_CONFIG,
                  theme: { palette: chartPalette },
                },
              },
            },
        ],
      },
    ],
  };
}

export const TABS_CONFIG: TabsMetadata = buildTabsShowcaseConfig();

export const STEPPER_IDENTITY_FORM_CONFIG: FormConfig = {
  sections: [
    {
      id: 'identity',
      title: 'Identity',
      rows: [
        {
          id: 'identity-main',
          columns: [
            { id: 'identity-name', fields: ['fullName'] },
            { id: 'identity-document', fields: ['cpf'] },
          ],
        },
        {
          id: 'identity-extra',
          columns: [
            { id: 'identity-birthDate', fields: ['birthDate'] },
            { id: 'identity-maritalStatus', fields: ['maritalStatus'] },
          ],
        },
      ],
    },
  ],
  fieldMetadata: [
    {
      name: 'fullName',
      label: 'Full name',
      controlType: 'input',
      required: true,
      maxLength: 200,
      group: 'Identity',
    } as any,
    {
      name: 'cpf',
      label: 'CPF',
      controlType: 'cpfCnpjInput',
      required: true,
      documentType: 'cpf',
      allowFormattedInput: true,
      mask: '000.000.000-00',
      pattern: '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})$',
      group: 'Identity',
    } as any,
    {
      name: 'birthDate',
      label: 'Birth date',
      controlType: 'date',
      required: true,
      displayFormat: 'MM/dd/yyyy',
      locale: 'en-US',
      mask: 'MM/dd/yyyy',
      max: 'today',
      group: 'Identity',
    } as any,
    {
      name: 'maritalStatus',
      label: 'Marital status',
      controlType: 'select',
      options: [
        { value: 'SOLTEIRO', label: 'Single' },
        { value: 'CASADO', label: 'Married' },
        { value: 'DIVORCIADO', label: 'Divorced' },
        { value: 'VIUVO', label: 'Widowed' },
        { value: 'UNIAO_ESTAVEL', label: 'Domestic partnership' },
      ],
      group: 'Identity',
    } as any,
  ],
} as FormConfig;

export const STEPPER_CONTACT_FORM_CONFIG: FormConfig = {
  sections: [
    {
      id: 'contact',
      title: 'Contact',
      rows: [
        {
          id: 'contact-main',
          columns: [
            { id: 'contact-email', fields: ['email'] },
            { id: 'contact-phone', fields: ['phone'] },
          ],
        },
      ],
    },
  ],
  fieldMetadata: [
    {
      name: 'email',
      label: 'Email',
      controlType: 'email',
      required: true,
      maxLength: 200,
      group: 'Contact',
    } as any,
    {
      name: 'phone',
      label: 'Phone',
      controlType: 'phone',
      required: true,
      maxLength: 30,
      pattern: '^\\+?\\d{8,15}$',
      autoFormat: true,
      defaultCountry: 'US',
      phoneFormat: 'international',
      group: 'Contact',
    } as any,
  ],
} as FormConfig;

export const STEPPER_PROFESSIONAL_FORM_CONFIG: FormConfig = {
  sections: [
    {
      id: 'professional',
      title: 'Professional',
      rows: [
        {
          id: 'professional-main',
          columns: [
            { id: 'professional-start', fields: ['startDate'] },
            { id: 'professional-salary', fields: ['salary'] },
          ],
        },
        {
          id: 'professional-links',
          columns: [
            { id: 'professional-department', fields: ['departmentId'] },
            { id: 'professional-role', fields: ['roleId'] },
          ],
        },
        {
          id: 'professional-status',
          columns: [
            { id: 'professional-active', fields: ['active'] },
          ],
        },
      ],
    },
  ],
  fieldMetadata: [
    {
      name: 'startDate',
      label: 'Start date',
      controlType: 'date',
      required: true,
      displayFormat: 'MM/dd/yyyy',
      locale: 'en-US',
      mask: 'MM/dd/yyyy',
      group: 'Professional',
    } as any,
    {
      name: 'salary',
      label: 'Salary',
      controlType: 'currency',
      required: true,
      min: 0,
      numericMin: 0,
      decimalPlaces: 2,
      locale: 'en-US',
      currency: 'USD',
      group: 'Professional',
    } as any,
    {
      name: 'departmentId',
      label: 'Department',
      controlType: 'select',
      required: true,
      endpoint: '/api/human-resources/departamentos/options/filter',
      valueField: 'id',
      displayField: 'label',
      group: 'Professional',
    } as any,
    {
      name: 'roleId',
      label: 'Role',
      controlType: 'select',
      required: true,
      endpoint: '/api/human-resources/cargos/options/filter',
      valueField: 'id',
      displayField: 'label',
      group: 'Professional',
    } as any,
    {
      name: 'active',
      label: 'Active employee',
      controlType: 'checkbox',
      required: true,
      group: 'Professional',
    } as any,
  ],
} as FormConfig;

export const STEPPER_CONFIG: StepperMetadata = {
  orientation: 'horizontal',
  headerPosition: 'top',
  linear: true,
  selectedIndex: 0,
  steps: [
    {
      id: 'identity',
      label: 'Identity',
      description: 'Start with the employee profile fields published by the API.',
      form: {
        formId: 'quickstart-stepper-identity',
        mode: 'create',
        config: STEPPER_IDENTITY_FORM_CONFIG,
      },
    },
    {
      id: 'contact',
      label: 'Contact',
      description: 'Keep communication details in a focused second step.',
      form: {
        formId: 'quickstart-stepper-contact',
        mode: 'create',
        config: STEPPER_CONTACT_FORM_CONFIG,
      },
    },
    {
      id: 'professional',
      label: 'Professional',
      description: 'Finish with the employment data that drives the workflow.',
      form: {
        formId: 'quickstart-stepper-professional',
        mode: 'create',
        config: STEPPER_PROFESSIONAL_FORM_CONFIG,
      },
    },
  ],
  navigation: {
    visible: true,
    prevLabel: 'Back',
    nextLabel: 'Next step',
    variant: 'stroked',
    align: 'space-between',
  },
};

export const EXPANSION_SIGNAL_CHART_CONFIG: PraxisChartConfig = {
  id: 'quickstart-expansion-signal-chart',
  title: 'Escalations by source',
  subtitle: 'Open this panel only when the team needs the deeper operational readout.',
  type: 'bar',
  theme: {
    palette: ['#1263b4', '#0f766e', '#f08c00', '#c92a2a'],
  },
  dataSource: {
    kind: 'local',
    items: [
      { source: 'Support', total: 12 },
      { source: 'Ops', total: 7 },
      { source: 'Success', total: 5 },
    ],
  },
  axes: {
    x: {
      field: 'source',
      type: 'category',
      label: 'Source',
    },
    y: {
      field: 'total',
      type: 'value',
      label: 'Escalations',
    },
  },
  series: [
    {
      id: 'total',
      type: 'bar',
      metric: {
        field: 'total',
        aggregation: 'sum',
      },
      name: 'Escalations',
    },
  ],
};

export function buildExpansionShowcaseConfig(): ExpansionMetadata {
  return {
    accordion: {
      multi: true,
      displayMode: 'default',
      togglePosition: 'after',
    },
    panels: [
      {
        id: 'snapshot',
        title: 'Performance snapshot',
        description: 'Keep the top panel open for the headline analytics.',
        expanded: true,
        widgets: [
          {
            id: 'praxis-chart',
            inputs: {
              config: TABS_OVERVIEW_CHART_CONFIG,
            },
          },
        ],
      },
      {
        id: 'narrative',
        title: 'Manager narrative',
        description: 'Open the editorial guidance only when the conversation needs it.',
        widgets: [
          {
            id: 'quickstart-editorial-runtime',
            inputs: {
              input: QUICKSTART_EDITORIAL_RUNTIME_INPUT,
            },
          },
        ],
      },
      {
        id: 'signals',
        title: 'Operational signals',
        description: 'Tuck the deeper readout behind its own panel.',
        widgets: [
          {
            id: 'praxis-chart',
            inputs: {
              config: EXPANSION_SIGNAL_CHART_CONFIG,
            },
          },
        ],
      },
    ],
  };
}

export const EXPANSION_CONFIG: ExpansionMetadata = buildExpansionShowcaseConfig();

