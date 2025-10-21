import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

type NavItem = { label: string; icon: string; link: string; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    NgClass,
    AsyncPipe,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);

  readonly groups: NavGroup[] = [
    {
      label: 'Heróis',
      items: [
        { label: 'Perfis', icon: 'badge', link: '/heroes/perfis' },
        { label: 'Habilidades', icon: 'psychology', link: '/heroes/habilidades' },
        { label: 'Reputações', icon: 'stars', link: '/heroes/reputacoes' },
      ]
    },
    {
      label: 'Operações',
      items: [
        { label: 'Resumo', icon: 'dashboard', link: '/operacoes/resumo' },
        { label: 'Missões', icon: 'flag', link: '/operacoes/missoes' },
        { label: 'Ameaças', icon: 'warning', link: '/operacoes/ameacas' },
      ]
    },
    {
      label: 'Compliance',
      items: [
        { label: 'Indicadores', icon: 'insights', link: '/compliance/indicadores' },
        { label: 'Incidentes', icon: 'report', link: '/compliance/incidentes' },
        { label: 'Indenizações', icon: 'payments', link: '/compliance/indenizacoes' },
      ]
    }
  ];

  isAsideActive$: Observable<boolean> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => !!this.findOutlet(this.route.root, 'aside')),
  );

  private findOutlet(route: ActivatedRoute, outlet: string): ActivatedRoute | null {
    for (const child of route.children) {
      if ((child as any).outlet === outlet) {
        return child;
      }
      const nested = this.findOutlet(child, outlet);
      if (nested) return nested;
    }
    return null;
  }

  closeAside() {
    // Fecha a rota auxiliar limpando o outlet 'aside'
    this.router.navigate([{ outlets: { aside: null } }], { relativeTo: this.route.root });
  }

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
