import { Routes } from '@angular/router';
import { providePraxisCharts, providePraxisChartsI18n } from '@praxisui/charts';
import { GenericCrudService } from '@praxisui/core';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { providePraxisTableMetadata } from '@praxisui/table';

export const TABLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/table-example-page.component').then((m) => m.TableExamplePageComponent),
    providers: [
      GenericCrudService,
      providePraxisDynamicFormMetadata(),
      providePraxisTableMetadata(),
      ...providePraxisCharts(),
      ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
    ],
  },
];
