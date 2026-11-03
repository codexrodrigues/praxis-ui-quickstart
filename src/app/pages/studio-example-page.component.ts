import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ASYNC_CONFIG_STORAGE,
  GlobalConfigService,
  type AsyncConfigStorage,
  type PageIdentity,
  type WidgetPageDefinition,
} from '@praxisui/core';
import {
  DynamicPageBuilderComponent,
  PraxisPageSaveAsComponent,
  createLocalPageSaveAsAdapter,
  type PageSaveAsAdapter,
  type PageSaveAsRequest,
  type PageSaveAsResult,
} from '@praxisui/page-builder';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomizationModeService } from '../customization-mode.service';
import { QUICKSTART_RESOURCE_PATH } from '../quickstart-content';
import { QuickstartTenantContextService } from '../quickstart-tenant-context.service';

const LOCAL_PAGES_STORAGE_PREFIX = 'praxis-ui-quickstart:saved-pages:v1:';

export const DEFAULT_STUDIO_PAGE: WidgetPageDefinition = {
  layout: {
    orientation: 'columns',
    columns: 12,
    gap: '16px',
  },
  canvas: {
    mode: 'grid',
    columns: 12,
    gap: '16px',
    collisionPolicy: 'push-down',
    items: {
      'quickstart-studio-employees': {
        widgetKey: 'quickstart-studio-employees',
        col: 1,
        row: 1,
        colSpan: 12,
        rowSpan: 8,
      },
    },
  },
  widgets: [
    {
      key: 'quickstart-studio-employees',
      shell: {
        kind: 'dashboard-card',
        title: 'Workforce Directory (Studio Canvas)',
        subtitle: `Published resource: ${QUICKSTART_RESOURCE_PATH}`,
        icon: 'badge',
        showHeader: true,
      },
      definition: {
        id: 'praxis-table',
        inputs: {
          tableId: 'quickstart-studio-employees-table',
          resourcePath: QUICKSTART_RESOURCE_PATH,
          enableCustomization: false,
        },
      },
    },
  ],
  composition: {
    links: [],
  },
};

@Component({
  selector: 'app-studio-example-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DynamicPageBuilderComponent,
    PraxisPageSaveAsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="studio-example-page" data-testid="quickstart-studio-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="studio-header">
        <div>
          <p class="eyebrow">Pillar 12 · Page Builder Studio & Save-As Route</p>
          <h1 data-testid="quickstart-studio-title">{{ pageTitle() }}</h1>
          <p class="subtitle">
            Build from a blank or starter canvas with 24 registered widget metadata contracts and save directly to
            <code>/pages/:pageId</code>.
          </p>
        </div>

        <div class="studio-save-as">
          <praxis-page-save-as
            #saveJourney
            [contextKey]="activePageKey()"
            [adapter]="saveAsAdapter"
            [initialTitle]="pageTitle()"
            [initialMenuLabel]="menuLabel()"
            [initialIcon]="pageIcon()"
            (saveRequested)="onSaveRequested(saveJourney)"
            (saved)="onPageSaved($event)"
          />
        </div>
      </header>

      <div class="studio-builder-host">
        <praxis-dynamic-page-builder
          data-testid="quickstart-studio-builder"
          [page]="pageDefinition()"
          [pageIdentity]="pageIdentity()"
          [autoPersist]="true"
          [enableCustomization]="customization.customizationEnabled()"
          [enableAgenticAuthoring]="true"
          [agenticAuthoringEnableStreaming]="true"
          (pageSaveRequested)="saveJourney.save($event)"
          (pageChange)="onPageChange($event)"
        />
      </div>
    </section>
  `,
  styles: [
    `
      .studio-example-page {
        display: grid;
        gap: 20px;
        min-width: 0;
      }
      .back-link {
        color: var(--qs-example-link);
        text-decoration: underline;
        width: max-content;
      }
      .studio-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }
      .eyebrow {
        margin: 0 0 6px;
        color: var(--qs-example-eyebrow);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.82rem;
      }
      h1 {
        margin: 0 0 6px;
        color: var(--qs-example-title);
      }
      .subtitle {
        margin: 0;
        color: var(--qs-example-muted);
      }
      .studio-builder-host {
        min-height: 520px;
      }
    `,
  ],
})
export class StudioExamplePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantContext = inject(QuickstartTenantContextService);
  private readonly globalConfig = inject(GlobalConfigService, { optional: true });
  private readonly storage = inject<AsyncConfigStorage>(ASYNC_CONFIG_STORAGE, { optional: true });
  protected readonly customization = inject(CustomizationModeService);
  protected readonly builder = viewChild(DynamicPageBuilderComponent);

  private readonly routePageId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('pageId'))),
    { initialValue: null },
  );

  private readonly routeStudioKey = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('studioKey'))),
    { initialValue: null },
  );

  protected readonly activePageKey = computed(
    () => this.routePageId() ?? this.routeStudioKey() ?? 'workspace',
  );

  protected readonly pageTitle = signal<string>('Workforce Custom Page');
  protected readonly menuLabel = signal<string>('Custom Pages');
  protected readonly pageIcon = signal<string>('dashboard_customize');
  protected readonly pageDefinition = signal<WidgetPageDefinition>(this.buildInitialPage());

  protected readonly pageIdentity = computed<PageIdentity>(() => ({
    appId: 'praxis-ui-quickstart',
    routePath: this.routePageId()
      ? `/pages/${this.routePageId()}`
      : `/studio/${this.activePageKey()}`,
    tenantId: this.tenantContext.currentTenant().id,
  }));

  protected readonly saveAsAdapter: PageSaveAsAdapter = createLocalPageSaveAsAdapter(
    async (request: PageSaveAsRequest): Promise<PageSaveAsResult> => {
      return this.persistPageAsNewRoute(request);
    },
  );

  constructor() {
    effect(() => {
      const pageId = this.routePageId();
      untracked(() => {
        if (pageId) {
          void this.restoreSavedPage(pageId);
        } else {
          this.pageDefinition.set(this.buildInitialPage());
        }
      });
    });
  }

  async persistPageAsNewRoute(request: PageSaveAsRequest): Promise<PageSaveAsResult> {
    const rawTitle = request.presentation?.title?.trim() || 'Workforce Custom Page';
    const rawMenu = request.menuLabel?.trim() || 'Custom Pages';
    const rawIcon = request.presentation?.icon?.trim() || 'dashboard_customize';
    const slug = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const pageId = `${slug || 'page'}-${Date.now().toString(36)}`;
    const routePath = `/pages/${pageId}`;
    const record = {
      title: rawTitle,
      menuLabel: rawMenu,
      icon: rawIcon,
      routePath,
      definition: request.definition,
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${LOCAL_PAGES_STORAGE_PREFIX}${pageId}`, JSON.stringify(record));
      } catch {
        /* ignore quota errors */
      }
    }

    if (this.storage) {
      try {
        await firstValueFrom(
          this.storage.saveConfig(`praxis-dynamic-page:quickstart:${pageId}`, record),
        );
      } catch {
        /* local storage fallback handles offline mode */
      }
    }

    this.pageTitle.set(rawTitle);
    this.menuLabel.set(rawMenu);
    this.pageIcon.set(rawIcon);
    return { pageId, routePath };
  }

  protected onSaveRequested(journey: PraxisPageSaveAsComponent): void {
    const currentDef = this.builder()?.currentPage() ?? this.pageDefinition();
    journey.save(currentDef);
  }

  protected onPageChange(next: WidgetPageDefinition): void {
    this.pageDefinition.set(next);
  }

  protected onPageSaved(result: PageSaveAsResult): void {
    if (result?.routePath) {
      void this.router.navigateByUrl(result.routePath);
    }
  }

  private async restoreSavedPage(pageId: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${LOCAL_PAGES_STORAGE_PREFIX}${pageId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            title?: string;
            menuLabel?: string;
            icon?: string;
            definition?: WidgetPageDefinition;
          };
          if (parsed.definition) {
            this.pageTitle.set(parsed.title || 'Workforce Custom Page');
            this.menuLabel.set(parsed.menuLabel || 'Custom Pages');
            this.pageIcon.set(parsed.icon || 'dashboard_customize');
            this.pageDefinition.set(parsed.definition);
            return;
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }

    if (this.storage) {
      try {
        const remote = await firstValueFrom(
          this.storage.loadConfig<{
            title?: string;
            menuLabel?: string;
            icon?: string;
            definition?: WidgetPageDefinition;
          }>(`praxis-dynamic-page:quickstart:${pageId}`),
        );
        if (remote?.definition) {
          this.pageTitle.set(remote.title || 'Workforce Custom Page');
          this.menuLabel.set(remote.menuLabel || 'Custom Pages');
          this.pageIcon.set(remote.icon || 'dashboard_customize');
          this.pageDefinition.set(remote.definition);
        }
      } catch {
        /* keep default page if not found */
      }
    }
  }

  private buildInitialPage(): WidgetPageDefinition {
    const cloned = JSON.parse(JSON.stringify(DEFAULT_STUDIO_PAGE)) as WidgetPageDefinition;
    const defaults = this.globalConfig?.getPages()?.defaults;
    if (defaults) {
      cloned.layout = {
        ...cloned.layout,
        columns: defaults.columns ?? 12,
        gap: defaults.gap ?? '16px',
      };
      if (cloned.canvas) {
        cloned.canvas = {
          ...cloned.canvas,
          columns: defaults.columns ?? 12,
          gap: defaults.gap ?? '16px',
        };
      }
    }
    return cloned;
  }
}
