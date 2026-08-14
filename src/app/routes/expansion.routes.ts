import { Routes } from '@angular/router';
import { providePraxisCharts, providePraxisChartsI18n } from '@praxisui/charts';
import {
  providePraxisEditorialForms,
  providePraxisEditorialFormsI18n,
} from '@praxisui/editorial-forms';
import { provideQuickstartEditorialWidgetMetadata } from '../quickstart-editorial-widget.metadata';

export const EXPANSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/expansion-example-page.component').then(
        (m) => m.ExpansionExamplePageComponent,
      ),
    providers: [
      ...providePraxisCharts(),
      ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      providePraxisEditorialForms(),
      providePraxisEditorialFormsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      provideQuickstartEditorialWidgetMetadata(),
    ],
  },
];
