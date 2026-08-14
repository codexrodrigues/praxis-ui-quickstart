import { Routes } from '@angular/router';
import { providePraxisCharts, providePraxisChartsI18n } from '@praxisui/charts';
import {
  providePraxisEditorialForms,
  providePraxisEditorialFormsI18n,
} from '@praxisui/editorial-forms';
import { provideQuickstartEditorialWidgetMetadata } from '../quickstart-editorial-widget.metadata';

export const TABS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/tabs-example-page.component').then((m) => m.TabsExamplePageComponent),
    providers: [
      ...providePraxisCharts(),
      ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      providePraxisEditorialForms(),
      providePraxisEditorialFormsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      provideQuickstartEditorialWidgetMetadata(),
    ],
  },
];
