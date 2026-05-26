import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import {
  type GlobalActionContext,
  type GlobalSurfaceService,
  PraxisSurfaceHostComponent,
  ResourceDiscoveryService,
  type ResourceSurfaceCatalogItem,
  ResourceSurfaceOpenAdapterService,
  type SurfaceOpenPayload,
} from '@praxisui/core';

interface RelatedSurfaceDialogData {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly widget: SurfaceOpenPayload['widget'];
  readonly context: Record<string, unknown>;
}

@Component({
  selector: 'app-related-surface-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, PraxisSurfaceHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-modal">
      <header class="surface-modal__header">
        <span class="surface-modal__icon">
          <mat-icon>{{ data.icon }}</mat-icon>
        </span>
        <div>
          <h2 mat-dialog-title>{{ data.title }}</h2>
          <p class="surface-modal__subtitle">{{ data.subtitle }}</p>
        </div>
      </header>

      <mat-dialog-content class="surface-modal__content">
        <praxis-surface-host
          [widget]="data.widget"
          [context]="data.context"
          [renderTitleInsideBody]="false"
        />
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="close()">Fechar</button>
      </mat-dialog-actions>
    </section>
  `,
  styles: [`
    .surface-modal { display:grid; gap:16px; color:#1f2937; min-width:0; }
    .surface-modal__header { display:flex; gap:14px; align-items:flex-start; padding:4px 0 0; }
    .surface-modal__icon { display:inline-grid; place-items:center; width:44px; height:44px; border:1px solid #cbd5e1; background:#f8fafc; color:#2563eb; flex:0 0 auto; }
    h2[mat-dialog-title] { margin:0; padding:0; font-size:1.35rem; font-weight:700; color:#111827; }
    .surface-modal__subtitle { margin:6px 0 0; color:#475569; line-height:1.45; }
    .surface-modal__content { display:grid; gap:16px; padding-top:0; }
    @media (max-width: 640px) {
      .surface-modal__header { display:grid; }
    }
  `],
})
class RelatedSurfaceDialogComponent {
  protected readonly data = inject<RelatedSurfaceDialogData>(MAT_DIALOG_DATA);
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

  open(payload: SurfaceOpenPayload, context?: GlobalActionContext): void {
    const row = (context?.runtime?.row || context?.payload?.row || {}) as Record<string, unknown>;

    this.dialog.open(RelatedSurfaceDialogComponent, {
      data: {
        title: payload.title || 'Surface relacionada',
        subtitle: payload.subtitle || '',
        icon: payload.icon || 'hub',
        widget: payload.widget,
        context: {
          payload: context?.payload ?? {},
          runtime: context?.runtime ?? {},
          row,
          meta: context?.meta ?? {},
          surface: payload.context ?? {},
        },
      } satisfies RelatedSurfaceDialogData,
      width: payload.size?.width || '880px',
      maxWidth: payload.size?.maxWidth || 'calc(100vw - 32px)',
      height: payload.size?.height,
      minWidth: payload.size?.minWidth,
      minHeight: payload.size?.minHeight,
      maxHeight: payload.size?.maxHeight,
      autoFocus: 'dialog',
      restoreFocus: true,
      panelClass: 'quickstart-related-surface-dialog',
    });
  }

  async openBackendSurfaceFromRow(options: {
    row: Record<string, unknown>;
    resourcePath: string;
    surfaceId: string;
    title?: string;
    subtitle?: string;
    icon?: string;
    size?: SurfaceOpenPayload['size'];
  }): Promise<void> {
    const catalog = await firstValueFrom(this.discovery.getSurfaces((options.row as any)._links));
    const surface = catalog.surfaces.find((candidate) => candidate.id === options.surfaceId);
    if (!surface) {
      throw new Error(`Backend surface "${options.surfaceId}" was not published for this row.`);
    }

    const resourceId = catalog.resourceId ?? (options.row['id'] as string | number | null);
    const payload = this.surfaceAdapter.toPayload(surface as ResourceSurfaceCatalogItem, {
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
      configPersistenceStrategy: 'input-first',
      componentInstanceId: `quickstart-${surface.id}-${resourceId}`,
    };

    this.open(payload, {
      payload: { row: options.row },
      runtime: { row: options.row },
      meta: { actionId: surface.id, surface },
    });
  }
}
