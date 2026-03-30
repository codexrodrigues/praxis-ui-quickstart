import { Routes } from '@angular/router';
import { providePraxisCharts, providePraxisChartsI18n } from '@praxisui/charts';
import { GenericCrudService } from '@praxisui/core';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { providePraxisEditorialForms, providePraxisEditorialFormsI18n } from '@praxisui/editorial-forms';
import { provideQuickstartEditorialWidgetMetadata } from './quickstart-editorial-widget.metadata';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page.component').then((m) => m.HomePageComponent),
    title: 'Praxis UI Quickstart',
  },
  {
    path: 'examples/table',
    loadComponent: () => import('./pages/table-example-page.component').then((m) => m.TableExamplePageComponent),
    title: 'Praxis UI Quickstart | Table',
  },
  {
    path: 'examples/form',
    loadComponent: () => import('./pages/form-example-page.component').then((m) => m.FormExamplePageComponent),
    title: 'Praxis UI Quickstart | Form',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/crud',
    loadComponent: () => import('./pages/crud-example-page.component').then((m) => m.CrudExamplePageComponent),
    title: 'Praxis UI Quickstart | CRUD',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/list',
    loadComponent: () => import('./pages/list-example-page.component').then((m) => m.ListExamplePageComponent),
    title: 'Praxis UI Quickstart | List',
  },
  {
    path: 'examples/manual-form',
    loadComponent: () => import('./pages/manual-form-example-page.component').then((m) => m.ManualFormExamplePageComponent),
    title: 'Praxis UI Quickstart | Manual Form',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/tabs',
    loadComponent: () => import('./pages/tabs-example-page.component').then((m) => m.TabsExamplePageComponent),
    title: 'Praxis UI Quickstart | Tabs',
    providers: [
      ...providePraxisCharts(),
      ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      providePraxisEditorialForms(),
      providePraxisEditorialFormsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      provideQuickstartEditorialWidgetMetadata(),
    ],
  },
  {
    path: 'examples/stepper',
    loadComponent: () => import('./pages/stepper-example-page.component').then((m) => m.StepperExamplePageComponent),
    title: 'Praxis UI Quickstart | Stepper',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/expansion',
    loadComponent: () => import('./pages/expansion-example-page.component').then((m) => m.ExpansionExamplePageComponent),
    title: 'Praxis UI Quickstart | Expansion',
    providers: [
      ...providePraxisCharts(),
      ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      providePraxisEditorialForms(),
      providePraxisEditorialFormsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),
      provideQuickstartEditorialWidgetMetadata(),
    ],
  },
  { path: '**', redirectTo: '' },
];
