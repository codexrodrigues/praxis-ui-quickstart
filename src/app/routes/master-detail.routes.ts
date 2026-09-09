import { providePraxisSettingsPanelBridge } from '@praxisui/settings-panel';
import { Routes } from '@angular/router';
import { GenericCrudService } from '@praxisui/core';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { providePraxisFilterMetadata, providePraxisTableMetadata } from '@praxisui/table';

export const MASTER_DETAIL_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('../pages/master-detail-example-page.component').then(m => m.MasterDetailExamplePageComponent),
  providers: [...providePraxisSettingsPanelBridge(), GenericCrudService, providePraxisDynamicFormMetadata(), providePraxisTableMetadata(), providePraxisFilterMetadata()],
}];
