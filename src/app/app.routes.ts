import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { PerfilEditorComponent } from './features/heroes/perfis/perfil-editor.component';
import { LoginComponent } from './features/shared/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { HomePage } from './features/home/home.page';

export const APP_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      { path: 'home', loadComponent: () => Promise.resolve(HomePage) },
      { path: 'componentes', loadComponent: () => import('./features/componentes/componentes.page').then(m => m.ComponentesPage) },
      { path: 'componentes/table', loadComponent: () => import('./features/componentes/table-demo.page').then(m => m.TableDemoPage) },
      { path: 'componentes/form', loadComponent: () => import('./features/componentes/form-demo.page').then(m => m.FormDemoPage) },
      { path: 'ferramentas', loadComponent: () => import('./features/ferramentas/ferramentas.page').then(m => m.FerramentasPage) },

      // Módulo: Heróis
      {
        path: 'heroes/perfis',
        loadComponent: () => import('./features/heroes/perfis/perfis-list.component').then(m => m.PerfisListComponent)
      },
      {
        path: 'heroes/habilidades',
        loadComponent: () => import('./features/heroes/habilidades/habilidades-list.component').then(m => m.HabilidadesListComponent)
      },
      {
        path: 'heroes/reputacoes',
        loadComponent: () => import('./features/heroes/reputacoes/reputacoes-list.component').then(m => m.ReputacoesListComponent)
      },

      // Módulo: Operações
      {
        path: 'operacoes/missoes',
        loadComponent: () => import('./features/operacoes/missoes/missoes-list.component').then(m => m.MissoesListComponent)
      },
      {
        path: 'operacoes/ameacas',
        loadComponent: () => import('./features/operacoes/ameacas/ameacas-list.component').then(m => m.AmeacasListComponent)
      },
      {
        path: 'operacoes/resumo',
        loadComponent: () => import('./features/operacoes/resumo/resumo.component').then(m => m.ResumoComponent)
      },

      // Módulo: Compliance
      {
        path: 'compliance/incidentes',
        loadComponent: () => import('./features/compliance/incidentes/incidentes-list.component').then(m => m.IncidentesListComponent)
      },
      {
        path: 'compliance/indenizacoes',
        loadComponent: () => import('./features/compliance/indenizacoes/indenizacoes-list.component').then(m => m.IndenizacoesListComponent)
      },
      {
        path: 'compliance/indicadores',
        loadComponent: () => import('./features/compliance/indicadores/indicadores-dashboard.component').then(m => m.IndicadoresDashboardComponent)
      },

      // Rota auxiliar (side-sheet) para edição contextual
      {
        path: 'heroes/perfis/:id/editar',
        outlet: 'aside',
        component: PerfilEditorComponent,
        data: { title: 'Editar Perfil' }
      }
    ]
  }
];
