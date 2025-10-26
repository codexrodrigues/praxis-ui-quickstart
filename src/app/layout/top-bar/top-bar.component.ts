import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SettingsPanelService, GlobalConfigEditorComponent } from '@praxisui/settings-panel';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="top-bar" role="navigation" aria-label="Utility navigation">
      <div class="left">
        <div class="brand">Praxis UI</div>
        <div class="tagline">Uma suíte completa de componentes UI Angular para desenvolvimento de aplicações empresariais modernas</div>
      </div>
      <div class="right">
        <span class="user" *ngIf="(isAuth$ | async); else guest">
          <span class="icon material-symbols-outlined" aria-hidden="true">account_circle</span>
          <span class="label">Logado como</span>
          <strong>{{ (username$ | async) || 'usuário' }}</strong>
        </span>
        <ng-template #guest>
          <span class="user guest">
            <span class="icon material-symbols-outlined" aria-hidden="true">person</span>
            <span class="label">Convidado</span>
          </span>
        </ng-template>
        <button mat-icon-button color="primary" class="global-config-btn" (click)="openGlobalConfig($event)" aria-label="Abrir configurações globais" [matTooltip]="'Configurações Globais'" matTooltipPosition="below">
          <mat-icon fontIcon="tune" aria-hidden="true"></mat-icon>
        </button>
        <button *ngIf="(isAuth$ | async)" class="logout" (click)="onLogout($event)" title="Encerrar sessão com segurança">Sair</button>
      </div>
    </div>
  `,
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  private readonly settings = inject(SettingsPanelService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  isAuth$ = this.auth.isAuthenticated$;
  username$ = this.auth.username$;
  openGlobalConfig(ev?: Event): void {
    ev?.preventDefault();
    try {
      this.settings.open({
        id: 'global-config',
        title: 'Configurações Globais',
        titleIcon: 'tune',
        content: { component: GlobalConfigEditorComponent, inputs: {} },
      });
    } catch (e) {
      console.warn('Global Config editor indisponível:', e);
    }
  }

  onLogout(ev?: Event): void {
    ev?.preventDefault();
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
