import { Injectable, inject } from '@angular/core';
import { FILTER_DRAWER_ADAPTER, FilterDrawerAdapter, FilterDrawerOpenConfig } from '@praxisui/table';
import { DrawerService } from '../drawer/drawer.service';
import { FilterDrawerBridgeService } from './filter-drawer-bridge.service';
import { FilterFormDrawerHostComponent } from './filter-form-drawer-host.component';

@Injectable({ providedIn: 'root' })
export class HostFilterDrawerAdapter implements FilterDrawerAdapter {
  private drawer = inject(DrawerService);
  private bridge = inject(FilterDrawerBridgeService);

  open(config: FilterDrawerOpenConfig): void {
    this.bridge.set({
      resourcePath: config.resourcePath,
      formId: config.formId,
      config: config.config,
      title: config.title,
      onSubmit: config.onSubmit,
      onClose: config.onClose,
      initialDto: config.initialDto,
    });
    this.drawer.open(FilterFormDrawerHostComponent);
  }
}

export const FILTER_DRAWER_ADAPTER_PROVIDER = { provide: FILTER_DRAWER_ADAPTER, useClass: HostFilterDrawerAdapter } as const;

