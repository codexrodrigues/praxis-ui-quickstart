import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { PrimaryNavComponent } from './components/layout/primary-nav/primary-nav.component';
import { SubnavComponent, SubnavItem } from './layout/subnav/subnav.component';
import { TopBarComponent } from './layout/top-bar/top-bar.component';
import { filter, map, startWith, Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, PrimaryNavComponent, SubnavComponent, TopBarComponent, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  subnavItems: SubnavItem[] = [];
  private sub?: Subscription;
  isLogin = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(e => {
          const url = e.urlAfterRedirects || e.url || '/';
          this.isLogin = this.isLoginUrl(url);
          return this.computeItems(url);
        }),
        startWith((() => { const u = this.router.url || '/'; this.isLogin = this.isLoginUrl(u); return this.computeItems(u); })()),
      )
      .subscribe(items => (this.subnavItems = items));
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private computeItems(url: string): SubnavItem[] {
    const path = url.split('?')[0].split('#')[0];
    const seg = path.replace(/^\//, '').split('/')[0] || 'home';
    switch (seg) {
      case 'operacoes':
        return [
          { label: 'Resumo', link: '/operacoes/resumo' },
          { label: 'Missões', link: '/operacoes/missoes' },
          { label: 'Ameaças', link: '/operacoes/ameacas' },
        ];
      case 'heroes':
        return [
          { label: 'Perfis', link: '/heroes/perfis' },
          { label: 'Habilidades', link: '/heroes/habilidades' },
          { label: 'Reputações', link: '/heroes/reputacoes' },
        ];
      case 'compliance':
        return [
          { label: 'Incidentes', link: '/compliance/incidentes' },
          { label: 'Indenizações', link: '/compliance/indenizacoes' },
          { label: 'Indicadores', link: '/compliance/indicadores' },
        ];
      case 'componentes':
        return [
          { label: 'Perfis (lista)', link: '/heroes/perfis' },
          { label: 'Habilidades', link: '/heroes/habilidades' },
          { label: 'Indicadores', link: '/compliance/indicadores' },
        ];
      case 'ferramentas':
        return [
          { label: 'Table Rules (Workspace)', link: '/componentes' },
          { label: 'Cron Builder (Workspace)', link: '/componentes' },
        ];
      case 'home':
      default:
        return [
          { label: 'Exemplos', link: '/operacoes/resumo' },
          { label: 'Componentes', link: '/componentes' },
          { label: 'Showcase', link: '/compliance/indicadores' },
        ];
    }
  }

  private isLoginUrl(url: string): boolean {
    const path = (url || '').split('?')[0].split('#')[0];
    return path === '/login' || path.startsWith('/login/');
  }
}
