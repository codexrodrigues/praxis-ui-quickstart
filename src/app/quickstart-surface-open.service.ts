import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable, inject, signal, type WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import {
  type GlobalActionContext,
  type GlobalSurfaceService,
  PraxisSurfaceHostComponent,
  ResourceDiscoveryService,
  type ResourceSurfaceCatalogItem,
  ResourceSurfaceOpenAdapterService,
  SurfaceOpenMaterializerService,
  type SurfaceOpenPayload,
} from '@praxisui/core';

interface RelatedSurfaceDialogData {
  readonly state: WritableSignal<RelatedSurfaceDialogState>;
}

interface RelatedSurfaceDialogState {
  readonly status: 'loading' | 'ready' | 'error';
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly widget?: SurfaceOpenPayload['widget'];
  readonly context: Record<string, unknown>;
  readonly loadingMessage?: string;
  readonly errorMessage?: string;
}

@Component({
  selector: 'app-related-surface-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PraxisSurfaceHostComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-modal">
      <header class="surface-modal__header">
        <span class="surface-modal__icon">
          <mat-icon>{{ state().icon }}</mat-icon>
        </span>
        <div>
          <h2 mat-dialog-title>{{ state().title }}</h2>
          <p class="surface-modal__subtitle">{{ state().subtitle }}</p>
        </div>
      </header>

      <mat-dialog-content class="surface-modal__content">
        <ng-container [ngSwitch]="state().status">
          <div *ngSwitchCase="'loading'" class="surface-modal__loading" role="status" aria-live="polite">
            <mat-spinner diameter="28" strokeWidth="3" />
            <div>
              <strong>Preparando surface</strong>
              <p>{{ state().loadingMessage || 'Carregando contrato, dados e metadados publicados pelo backend.' }}</p>
            </div>
          </div>

          <div *ngSwitchCase="'error'" class="surface-modal__error" role="alert">
            <mat-icon>error_outline</mat-icon>
            <div>
              <strong>Nao foi possivel abrir a surface</strong>
              <p>{{ state().errorMessage }}</p>
            </div>
          </div>

          <praxis-surface-host
            *ngSwitchDefault
            [widget]="state().widget!"
            [context]="state().context"
            [renderTitleInsideBody]="false"
          />
        </ng-container>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="close()">Fechar</button>
      </mat-dialog-actions>
    </section>
  `,
  styles: [`
    .surface-modal {
      display:grid;
      gap:16px;
      color:var(--md-sys-color-on-surface, #1f2937);
      min-width:0;
    }
    .surface-modal__header { display:flex; gap:14px; align-items:flex-start; padding:4px 0 0; }
    .surface-modal__icon {
      display:inline-grid;
      place-items:center;
      width:44px;
      height:44px;
      border:1px solid var(--md-sys-color-outline-variant, #cbd5e1);
      background:var(--md-sys-color-surface-container-low, #f8fafc);
      color:var(--md-sys-color-primary, #2563eb);
      flex:0 0 auto;
    }
    h2[mat-dialog-title] {
      margin:0;
      padding:0;
      font-size:1.35rem;
      font-weight:700;
      color:var(--md-sys-color-on-surface, #111827);
    }
    .surface-modal__subtitle {
      margin:6px 0 0;
      color:var(--md-sys-color-on-surface-variant, #475569);
      line-height:1.45;
    }
    .surface-modal__content { display:grid; gap:16px; padding-top:0; }
    .surface-modal__loading,
    .surface-modal__error {
      display:flex;
      gap:14px;
      align-items:flex-start;
      padding:18px;
      border:1px solid var(--md-sys-color-outline-variant, #dbe4f0);
      background:var(--md-sys-color-surface-container-low, #f8fafc);
      min-height:104px;
    }
    .surface-modal__loading strong,
    .surface-modal__error strong {
      display:block;
      margin:0 0 4px;
      color:var(--md-sys-color-on-surface, #111827);
    }
    .surface-modal__loading p,
    .surface-modal__error p {
      margin:0;
      color:var(--md-sys-color-on-surface-variant, #475569);
      line-height:1.45;
    }
    .surface-modal__error {
      border-color:var(--md-sys-color-error, #dc2626);
      background:var(--md-sys-color-error-container, #fff7f7);
    }
    .surface-modal__error mat-icon { color:var(--md-sys-color-error, #dc2626); }
    @media (max-width: 640px) {
      .surface-modal__header { display:grid; }
    }
  `],
})
class RelatedSurfaceDialogComponent {
  protected readonly data = inject<RelatedSurfaceDialogData>(MAT_DIALOG_DATA);
  protected readonly state = this.data.state;
  private readonly dialogRef = inject(MatDialogRef<RelatedSurfaceDialogComponent>);

  protected close(): void {
    this.dialogRef.close();
  }
}

@Injectable()
export class QuickstartSurfaceOpenService implements GlobalSurfaceService {
  private readonly dialog = inject(MatDialog);
  private readonly discovery = inject(ResourceDiscoveryService);
  private readonly surfaceAdapter = inject(ResourceSurfaceOpenAdapterService);
  private readonly surfaceMaterializer = inject(SurfaceOpenMaterializerService);

  async open(payload: SurfaceOpenPayload, context?: GlobalActionContext): Promise<void> {
    const row = (context?.runtime?.row || context?.payload?.row || {}) as Record<string, unknown>;
    const pending = this.openPendingDialog({
      title: payload.title || 'Surface relacionada',
      subtitle: payload.subtitle || '',
      icon: payload.icon || 'hub',
      size: payload.size,
      row,
      context: {
        payload: context?.payload ?? {},
        runtime: context?.runtime ?? {},
        row,
        meta: context?.meta ?? {},
        surface: payload.context ?? {},
      },
      loadingMessage: 'Carregando dados e metadados da surface.',
    });

    void this.materializeIntoDialog(pending, payload, context, row);
  }

  async openBackendSurfaceFromRow(options: {
    row: Record<string, unknown>;
    resourcePath: string;
    surfaceId: string;
    title?: string;
    subtitle?: string;
    icon?: string;
    size?: SurfaceOpenPayload['size'];
    payload?: SurfaceOpenPayload;
  }): Promise<void> {
    const row = options.row;
    const pending = this.openPendingDialog({
      title: options.title || 'Surface relacionada',
      subtitle: options.subtitle || 'Preparando contrato publicado pelo backend.',
      icon: options.icon || 'hub',
      size: options.size,
      row,
      context: {
        payload: { row },
        runtime: { row },
        row,
        meta: { actionId: options.surfaceId },
        surface: {},
      },
      loadingMessage: 'Consultando surfaces, contrato e dados publicados pelo backend.',
    });

    try {
      const catalog = await firstValueFrom(this.discovery.getSurfaces((options.row as any)._links));
      const surface = catalog.surfaces.find((candidate) => candidate.id === options.surfaceId);
      if (!surface) {
        throw new Error(`Backend surface "${options.surfaceId}" was not published for this row.`);
      }

      const resourceId = catalog.resourceId ?? (options.row['id'] as string | number | null);
      const payload = options.payload
        ? this.withDiscoveredSurfaceContext(this.clone(options.payload), surface as ResourceSurfaceCatalogItem, options.resourcePath, resourceId)
        : this.surfaceAdapter.toPayload(surface as ResourceSurfaceCatalogItem, {
            resourcePath: options.resourcePath,
            resourceId,
            presentation: 'modal',
            title: options.title || surface.title,
            subtitle: options.subtitle || surface.description || undefined,
            icon: options.icon,
          });

      payload.size = options.size ?? payload.size;
      payload.widget.inputs = {
        ...(payload.widget.inputs || {}),
        enableCustomization: false,
      };

      await this.materializeIntoDialog(pending, payload, {
        payload: { row: options.row },
        runtime: { row: options.row },
        meta: { actionId: surface.id, surface },
      }, row);
    } catch (error) {
      this.showDialogError(pending, error);
    }
  }

  private withDiscoveredSurfaceContext(
    payload: SurfaceOpenPayload,
    surface: ResourceSurfaceCatalogItem,
    resourcePath: string,
    resourceId: string | number | null,
  ): SurfaceOpenPayload {
    return {
      ...payload,
      context: {
        ...(payload.context || {}),
        resource: {
          resourceKey: surface.resourceKey,
          resourcePath,
          resourceId,
        },
        surface: {
          id: surface.id,
          kind: surface.kind,
          scope: surface.scope,
          intent: surface.intent ?? null,
          operationId: surface.operationId,
          path: surface.path,
          method: surface.method,
          schemaId: surface.schemaId,
          schemaUrl: surface.schemaUrl,
          responseCardinality: surface.responseCardinality ?? null,
          availability: surface.availability,
          tags: surface.tags,
        },
      },
    };
  }

  private openPendingDialog(options: {
    title: string;
    subtitle: string;
    icon: string;
    size?: SurfaceOpenPayload['size'];
    row: Record<string, unknown>;
    context: Record<string, unknown>;
    loadingMessage: string;
  }): {
    ref: MatDialogRef<RelatedSurfaceDialogComponent>;
    state: WritableSignal<RelatedSurfaceDialogState>;
  } {
    const state = signal<RelatedSurfaceDialogState>({
      status: 'loading',
      title: options.title,
      subtitle: options.subtitle,
      icon: options.icon,
      context: options.context,
      loadingMessage: options.loadingMessage,
    });

    const ref = this.dialog.open(RelatedSurfaceDialogComponent, {
      data: { state } satisfies RelatedSurfaceDialogData,
      width: options.size?.width || '880px',
      maxWidth: options.size?.maxWidth || 'calc(100vw - 32px)',
      height: options.size?.height,
      minWidth: options.size?.minWidth,
      minHeight: options.size?.minHeight,
      maxHeight: options.size?.maxHeight,
      autoFocus: 'dialog',
      restoreFocus: true,
      panelClass: 'quickstart-related-surface-dialog',
    });

    return { ref, state };
  }

  private async materializeIntoDialog(
    pending: {
      ref: MatDialogRef<RelatedSurfaceDialogComponent>;
      state: WritableSignal<RelatedSurfaceDialogState>;
    },
    payload: SurfaceOpenPayload,
    context: GlobalActionContext | undefined,
    row: Record<string, unknown>,
  ): Promise<void> {
    try {
      const materializedPayload = await this.surfaceMaterializer.materialize(payload, context);
      if (pending.ref.getState() === MatDialogState.CLOSED) {
        return;
      }
      pending.state.set({
        status: 'ready',
        title: materializedPayload.title || 'Surface relacionada',
        subtitle: materializedPayload.subtitle || '',
        icon: materializedPayload.icon || 'hub',
        widget: materializedPayload.widget,
        context: {
          payload: context?.payload ?? {},
          runtime: context?.runtime ?? {},
          row,
          meta: context?.meta ?? {},
          surface: materializedPayload.context ?? {},
        },
      });
    } catch (error) {
      this.showDialogError(pending, error);
    }
  }

  private showDialogError(
    pending: {
      ref: MatDialogRef<RelatedSurfaceDialogComponent>;
      state: WritableSignal<RelatedSurfaceDialogState>;
    },
    error: unknown,
  ): void {
    if (pending.ref.getState() === MatDialogState.CLOSED) {
      return;
    }
    pending.state.update((current) => ({
      ...current,
      status: 'error',
      errorMessage: error instanceof Error && error.message
        ? error.message
        : String(error || 'Falha ao abrir a surface.'),
    }));
  }

  private clone<T>(value: T): T {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }
}
