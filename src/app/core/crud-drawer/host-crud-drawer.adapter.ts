import { Injectable, inject } from '@angular/core';
import { CRUD_DRAWER_ADAPTER, CrudDrawerAdapter, CrudDrawerOpenConfig } from '@praxisui/crud';
import { DrawerService } from '../drawer/drawer.service';
import { CrudDrawerBridgeService } from './crud-drawer-bridge.service';
import { DynamicFormDrawerHostComponent } from './dynamic-form-drawer-host.component';

@Injectable({ providedIn: 'root' })
export class HostCrudDrawerAdapter implements CrudDrawerAdapter {
  private drawer = inject(DrawerService);
  private bridge = inject(CrudDrawerBridgeService);

  open(config: CrudDrawerOpenConfig): void {
    const idField = config.metadata.resource?.idField ?? 'id';
    const resourceId = (config.inputs as any)[idField] as any;
    const formId = config.action.formId || `${(config.metadata.resource?.path || 'default').replace(/\//g, '-')}-form`;
    this.bridge.set({
      formId,
      resourcePath: config.metadata.resource?.path,
      resourceId,
      mode: (config.action as any).action === 'view' ? 'view' : (config.action as any).action === 'create' ? 'create' : 'edit',
      backConfig: config.action.back || config.metadata.defaults?.back,
      title: (config.action as any).label || 'Formulário',
    });
    this.drawer.open(DynamicFormDrawerHostComponent);
  }
}

export const CRUD_DRAWER_ADAPTER_PROVIDER = { provide: CRUD_DRAWER_ADAPTER, useClass: HostCrudDrawerAdapter } as const;

