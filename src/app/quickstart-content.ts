import type { CrudMetadata } from '@praxisui/crud';
import type { PraxisChartConfig } from '@praxisui/charts';
import type { EditorialRuntimeInput } from '@praxisui/editorial-forms';
import type { ExpansionMetadata } from '@praxisui/expansion';
import type { FormConfig, GlobalConfig, TableConfig } from '@praxisui/core';
import type { PraxisListConfig } from '@praxisui/list';
import type { StepperMetadata } from '@praxisui/stepper';
import type { TabsMetadata } from '@praxisui/tabs';

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

export const PRAXIS_API_ORIGIN =
  (globalThis as { __PRAXIS_API_ORIGIN__?: string }).__PRAXIS_API_ORIGIN__?.trim() ||
  'https://praxis-api-quickstart.onrender.com';

export const PRAXIS_API_BASE_URL = `${PRAXIS_API_ORIGIN}/api`;
export const QUICKSTART_RESOURCE_PATH = 'human-resources/funcionarios';
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
  '4 core runtimes in the main adoption path',
  '4 advanced examples kept outside the primary navigation',
  'Same public backend used by the landing page',
  'Backend already exposes operations, assets, and risk intelligence',
  'Canonical bootstrap with API_URL, PAX_FETCH_HEADERS, and host-owned theme',
] as const;

export const HOME_INTRO = {
  title: 'Connect the host, prove the core path, then expand into advanced patterns.',
  eyebrow: 'Canonical first contact with PraxisUI and the Praxis platform.',
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
    description: 'Keep a host-owned layout and still unlock governed customization when the core path is already clear.',
  },
  {
    title: 'Praxis Tabs',
    route: '/examples/tabs',
    icon: 'tabs',
    description: 'Split supporting content into focused views after the host, resource path, and theme ownership are already proven.',
  },
  {
    title: 'Praxis Stepper',
    route: '/examples/stepper',
    icon: 'checklist',
    description: 'Guide a longer flow once the baseline runtime integration is already in place.',
  },
  {
    title: 'Praxis Expansion',
    route: '/examples/expansion',
    icon: 'expand_content',
    description: 'Group supporting content into panels when the team is ready to explore richer composition patterns.',
  },
];

export const SETUP_STEPS: readonly SetupStep[] = [
  {
    title: 'Install the aligned stack',
    detail:
      'Keep the @praxisui/* packages on the same range and avoid starting with local dependencies or temporary aliases.',
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
      'The published API already includes operations, assets, and risk-intelligence, but the quickstart should only branch into those domains after the primary resource path is proven.',
  },
  {
    title: 'Keep the theme in the host',
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
    eyebrow: 'Frontend scope',
    title: 'One resource path is still the first proof.',
    detail:
      'This quickstart intentionally stays centered on human-resources/funcionarios so teams can verify host bootstrap, metadata resolution, and runtime reuse before they branch into additional backend domains.',
    bullets: [
      'Table, form, CRUD, and list all reuse the same published resourcePath.',
      'The first read is about proving the platform, not touring every backend route group.',
      'This keeps onboarding stable while the backend continues to evolve.',
    ],
  },
  {
    eyebrow: 'Backend scope',
    title: 'The published API is broader than the first UI path.',
    detail:
      'The backend already exposes operations, assets, and risk-intelligence in addition to human-resources. Those domains belong to later examples, not to the first-read adoption path of this host.',
    bullets: [
      'Human resources remains the canonical first contact.',
      'Additional route groups are expansion material, not onboarding prerequisites.',
      'The host should communicate this difference explicitly so expectations stay aligned.',
    ],
  },
] as const;

export const INSTALL_COMMAND = `npm install \\
  @angular/animations @angular/cdk @angular/material \\
  @praxisui/ai @praxisui/core @praxisui/cron-builder @praxisui/charts \\
  @praxisui/dynamic-fields @praxisui/dynamic-form @praxisui/crud \\
  @praxisui/editorial-forms @praxisui/list @praxisui/manual-form \\
  @praxisui/table @praxisui/tabs @praxisui/stepper @praxisui/expansion`;

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

export const GLOBAL_CONFIG_SEED: Partial<GlobalConfig> = {
  crud: {
    defaults: {
      openMode: 'modal',
    },
  },
  dynamicFields: {
    asyncSelect: { loadOn: 'open' },
    cascade: { enable: true, loadOnChange: 'respectLoadOn', debounceMs: 250 },
  },
  table: {
    appearance: {
      density: 'compact',
      spacing: {
        cellPadding: '6px 12px',
        headerPadding: '8px 12px',
      },
      typography: {
        fontSize: '13px',
        headerFontSize: '13px',
      },
    },
    filteringUi: {
      advancedOpenMode: 'drawer',
      overlayVariant: 'card',
      overlayBackdrop: true,
    },
  },
};
