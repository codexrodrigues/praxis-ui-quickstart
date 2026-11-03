import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AI_BACKEND_STORAGE_OPTIONS,
  AgenticAuthoringTurnClientService,
  PraxisAssistantTurnOrchestratorService,
  type PraxisAssistantRecommendedIntent,
  type PraxisAssistantShellAction,
  type PraxisAssistantShellContextItem,
  type PraxisAssistantShellLabels,
  type PraxisAssistantShellLayout,
  type PraxisAssistantShellMessage,
  type PraxisAssistantShellMode,
  type PraxisAssistantShellQuickReply,
  type PraxisAssistantShellState,
} from '@praxisui/ai';
import {
  PraxisRuntimeComponentObservationRegistryService,
  type PraxisRuntimeComponentObservationEnvelope,
} from '@praxisui/core';
import { PAGE_BUILDER_AGENTIC_AUTHORING_OPTIONS } from '@praxisui/page-builder';
import { QuickstartTenantContextService } from './quickstart-tenant-context.service';

export interface QuickstartAssistantContextHints {
  readonly surfaceId: string;
  readonly targetRoute?: string;
  readonly resourcePaths?: readonly string[];
  readonly authoringScope?: 'consult' | 'studio';
}

const QUICKSTART_CATALOG = [
  {
    resourcePath: 'human-resources/funcionarios',
    title: 'Employees (Funcionários)',
    route: '/examples/crud',
    description: 'Core employee directory with Quick View 360°, related surfaces, and CRUD operations.',
  },
  {
    resourcePath: 'human-resources/folhas-pagamento',
    title: 'Payroll (Folhas de Pagamento)',
    route: '/examples/reactive-determinations',
    description: 'Payroll cycles with reactive determinations, ETag concurrency, and analytics.',
  },
  {
    resourcePath: 'human-resources/eventos-folha',
    title: 'Payroll Events (Eventos de Folha)',
    route: '/examples/reactive-determinations',
    description: 'Master-detail child items of payroll cycles with reactive calculation.',
  },
  {
    resourcePath: 'human-resources/enderecos',
    title: 'Addresses (Endereços)',
    route: '/examples/reactive-determinations',
    description: 'Address resource with cross-entity reactive determinations.',
  },
  {
    resourcePath: 'human-resources/departamentos',
    title: 'Departments (Departamentos)',
    route: '/resources/departamentos',
    description: 'Organizational departments option source and declarative CRUD route.',
  },
  {
    resourcePath: 'human-resources/cargos',
    title: 'Roles (Cargos)',
    route: '/resources/cargos',
    description: 'Job roles option source and declarative CRUD route.',
  },
  {
    resourcePath: 'operations/missao-participantes',
    title: 'Mission Participations (Missões)',
    route: '/examples/table',
    description: 'Related 1:N operational missions per employee.',
  },
] as const;

@Injectable({ providedIn: 'root' })
export class QuickstartAiAssistantService {
  private readonly router = inject(Router, { optional: true });
  private readonly tenantContext = inject(QuickstartTenantContextService);
  private readonly turnClient = inject(AgenticAuthoringTurnClientService, { optional: true });
  private readonly turnOrchestrator = inject(PraxisAssistantTurnOrchestratorService, {
    optional: true,
  });
  private readonly observationRegistry = inject(
    PraxisRuntimeComponentObservationRegistryService,
    { optional: true },
  );

  readonly aiBackendOptions = inject(AI_BACKEND_STORAGE_OPTIONS, { optional: true });
  readonly agenticAuthoringOptions = inject(PAGE_BUILDER_AGENTIC_AUTHORING_OPTIONS, {
    optional: true,
  });

  readonly isOpen = signal<boolean>(false);
  readonly mode = signal<PraxisAssistantShellMode>('chat');
  readonly state = signal<PraxisAssistantShellState>('idle');
  readonly prompt = signal<string>('');
  readonly busy = signal<boolean>(false);
  readonly canApply = signal<boolean>(false);
  readonly errorText = signal<string>('');
  readonly pendingRouteToApply = signal<string | null>(null);
  readonly activeSurfaceId = signal<string>('quickstart:app-shell');

  readonly layout = signal<PraxisAssistantShellLayout>({
    left: 940,
    top: 156,
    width: 420,
    height: 580,
  });

  readonly labels: Partial<PraxisAssistantShellLabels> = {
    title: 'Praxis Quickstart AI Assistant',
    subtitle: '12-Pillar Host · Semantic Catalog & Studio Authoring',
    promptPlaceholder: 'Ask about Quickstart resources, reactive determinations, or Studio...',
    submit: 'Ask AI',
    apply: 'Open Suggested Route',
  };

  readonly messages = signal<PraxisAssistantShellMessage[]>([
    {
      id: 'welcome-quickstart-ai',
      role: 'assistant',
      text: 'Welcome to the Praxis UI Quickstart AI Assistant (@praxisui/ai). I can inspect the published HR & Operations resources, explain Reactive Determinations, or guide you to the Page Builder Studio (/studio/workspace).',
      status: 'done',
    },
  ]);

  readonly statusText = computed(() => {
    const tenant = this.tenantContext.currentTenant();
    if (this.busy()) {
      return `Inspecting semantic catalog for ${tenant.label}...`;
    }
    if (this.canApply() && this.pendingRouteToApply()) {
      return `Ready to open ${this.pendingRouteToApply()} · ${tenant.badge}`;
    }
    const status = this.turnOrchestrator && this.turnClient ? 'Connected' : 'Ready';
    return `${status} · Tenant: ${tenant.label} (${tenant.id})`;
  });

  readonly canSubmit = computed(() => !this.busy() && this.prompt().trim().length > 0);

  readonly contextItems = computed<readonly PraxisAssistantShellContextItem[]>(() => {
    const tenant = this.tenantContext.currentTenant();
    const obsCount = this.captureTrustedRuntimeObservations().length;
    return [
      {
        id: 'ctx-tenant',
        label: `Tenant: ${tenant.label}`,
        value: `X-Tenant-ID: ${tenant.id}`,
        icon: 'domain',
      },
      {
        id: 'ctx-resources',
        label: `${QUICKSTART_CATALOG.length} Published Resources`,
        value: `${obsCount} runtime observations`,
        icon: 'dataset',
      },
    ];
  });

  readonly recommendedIntents = signal<
    ReadonlyArray<
      PraxisAssistantRecommendedIntent & {
        readonly contextHints: QuickstartAssistantContextHints;
      }
    >
  >([
    {
      id: 'intent-studio-builder',
      label: 'Compose in Page Builder Studio',
      description: 'Create a blank dynamic page and save it as a new route (/pages/:pageId)',
      prompt: 'How do I create a blank page in Studio and save it to a new route?',
      icon: 'auto_awesome_mosaic',
      action: {
        kind: 'submit-prompt',
        prompt: 'How do I create a blank page in Studio and save it to a new route?',
      },
      contextHints: {
        surfaceId: 'quickstart:studio',
        targetRoute: '/studio/workspace',
        authoringScope: 'studio',
      },
    },
    {
      id: 'intent-reactive-determinations',
      label: 'Inspect Reactive Determinations',
      description: 'Explore backend-driven address and payroll determinations',
      prompt: 'Which resources publish reactive determinations in the Quickstart?',
      icon: 'account_tree',
      action: {
        kind: 'submit-prompt',
        prompt: 'Which resources publish reactive determinations in the Quickstart?',
      },
      contextHints: {
        surfaceId: 'quickstart:reactive-determinations',
        targetRoute: '/examples/reactive-determinations',
        resourcePaths: [
          'human-resources/enderecos',
          'human-resources/folhas-pagamento',
          'human-resources/eventos-folha',
        ],
        authoringScope: 'consult',
      },
    },
  ]);

  readonly quickReplies = signal<readonly PraxisAssistantShellQuickReply[]>([
    {
      id: 'qr-list-resources',
      label: 'List all Quickstart resources',
      prompt: 'List all published resources in the Quickstart catalog',
      value: 'quickstart.catalog.list',
      canonicalAction: { kind: 'consult.catalog', scope: 'catalog' },
      contextHints: {
        surfaceId: 'quickstart:catalog',
        authoringScope: 'consult',
      },
    },
    {
      id: 'qr-open-studio',
      label: 'Open Page Builder Studio',
      prompt: 'Open the Page Builder Studio (/studio/workspace)',
      value: 'quickstart.studio.open',
      canonicalAction: { kind: 'navigate.studio', targetRoute: '/studio/workspace' },
      contextHints: {
        surfaceId: 'quickstart:studio',
        targetRoute: '/studio/workspace',
        authoringScope: 'studio',
      },
    },
  ]);

  open(initialPrompt?: string): void {
    this.isOpen.set(true);
    if (initialPrompt?.trim()) {
      this.prompt.set(initialPrompt.trim());
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setPrompt(value: string): void {
    this.prompt.set(value ?? '');
  }

  captureTrustedRuntimeObservations(): readonly PraxisRuntimeComponentObservationEnvelope[] {
    if (!this.observationRegistry) {
      return [];
    }
    try {
      const snapshot = (
        this.observationRegistry as unknown as {
          snapshot?: () => readonly PraxisRuntimeComponentObservationEnvelope[];
        }
      ).snapshot?.();
      return Array.isArray(snapshot) ? snapshot : [];
    } catch {
      return [];
    }
  }

  submitPrompt(customPrompt?: string, structuredHints?: QuickstartAssistantContextHints): void {
    const query = (customPrompt ?? this.prompt()).trim();
    if (!query) {
      return;
    }

    const userMsg: PraxisAssistantShellMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      status: 'done',
    };

    this.messages.update((list) => [...list, userMsg]);
    this.prompt.set('');
    this.busy.set(true);
    this.state.set('processing');
    this.errorText.set('');

    const summary = QUICKSTART_CATALOG.map(
      (item) => `• **${item.title}** (\`${item.resourcePath}\` → \`${item.route}\`): ${item.description}`,
    ).join('\n');

    const assistantMsg: PraxisAssistantShellMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      text: `Quickstart Semantic Catalog (${QUICKSTART_CATALOG.length} resources):\n${summary}`,
      status: 'done',
    };

    this.messages.update((list) => [...list, assistantMsg]);
    this.pendingRouteToApply.set(structuredHints?.targetRoute ?? null);
    this.canApply.set(Boolean(structuredHints?.targetRoute));
    this.mode.set(structuredHints?.authoringScope === 'studio' ? 'agentic-authoring' : 'chat');
    this.busy.set(false);
    this.state.set('idle');
  }

  triggerQuickReply(reply: PraxisAssistantShellQuickReply): void {
    const rawHints = (reply.contextHints ?? {}) as Record<string, unknown>;
    this.submitPrompt(reply.prompt || reply.label, {
      surfaceId:
        typeof rawHints['surfaceId'] === 'string'
          ? rawHints['surfaceId']
          : this.activeSurfaceId(),
      targetRoute:
        typeof rawHints['targetRoute'] === 'string' ? rawHints['targetRoute'] : undefined,
      authoringScope:
        (rawHints['authoringScope'] as QuickstartAssistantContextHints['authoringScope']) ??
        'consult',
    });
  }

  triggerRecommendedIntent(intent: PraxisAssistantRecommendedIntent): void {
    const typed = intent as PraxisAssistantRecommendedIntent & {
      readonly contextHints?: QuickstartAssistantContextHints;
    };
    this.submitPrompt(intent.prompt || intent.label, typed.contextHints);
  }

  applyPendingSuggestion(): void {
    const route = this.pendingRouteToApply();
    if (!route || !this.router) {
      return;
    }
    this.canApply.set(false);
    void this.router.navigateByUrl(route);
  }

  handleShellAction(action: PraxisAssistantShellAction): void {
    if (action.id === 'clear' || action.id === 'reset') {
      this.messages.set([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: 'Conversation reset. Ask about Quickstart resources or open the Page Builder Studio.',
          status: 'done',
        },
      ]);
      this.canApply.set(false);
      this.pendingRouteToApply.set(null);
      this.mode.set('chat');
    }
  }
}
