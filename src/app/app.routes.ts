import { Routes } from '@angular/router';
import { GenericCrudService } from '@praxisui/core';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page.component').then((m) => m.HomePageComponent),
    title: 'Praxis UI Quickstart',
  },
  {
    path: 'examples/table',
    loadChildren: () => import('./routes/table.routes').then((m) => m.TABLE_ROUTES),
    title: 'Praxis UI Quickstart | Table',
  },
  {
    path: 'examples/form',
    loadComponent: () =>
      import('./pages/form-example-page.component').then((m) => m.FormExamplePageComponent),
    title: 'Praxis UI Quickstart | Form',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/reactive-determinations',
    loadComponent: () =>
      import('./pages/reactive-determinations-example-page.component').then(
        (m) => m.ReactiveDeterminationsExamplePageComponent,
      ),
    title: 'Praxis UI Quickstart | Reactive Determinations',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/crud',
    loadComponent: () =>
      import('./pages/crud-example-page.component').then((m) => m.CrudExamplePageComponent),
    title: 'Praxis UI Quickstart | CRUD',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/list',
    loadComponent: () =>
      import('./pages/list-example-page.component').then((m) => m.ListExamplePageComponent),
    title: 'Praxis UI Quickstart | List',
  },
  {
    path: 'examples/manual-form',
    loadComponent: () =>
      import('./pages/manual-form-example-page.component').then(
        (m) => m.ManualFormExamplePageComponent,
      ),
    title: 'Praxis UI Quickstart | Manual Form',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/tabs',
    loadChildren: () => import('./routes/tabs.routes').then((m) => m.TABS_ROUTES),
    title: 'Praxis UI Quickstart | Tabs',
  },
  {
    path: 'examples/stepper',
    loadComponent: () =>
      import('./pages/stepper-example-page.component').then((m) => m.StepperExamplePageComponent),
    title: 'Praxis UI Quickstart | Stepper',
    providers: [GenericCrudService, providePraxisDynamicFormMetadata()],
  },
  {
    path: 'examples/expansion',
    loadChildren: () => import('./routes/expansion.routes').then((m) => m.EXPANSION_ROUTES),
    title: 'Praxis UI Quickstart | Expansion',
  },
  { path: '**', redirectTo: '' },
];
