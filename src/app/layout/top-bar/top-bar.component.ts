import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [AsyncPipe, NgIf],
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
        <button *ngIf="!(isAuth$ | async)" class="login" (click)="onLogin($event)" title="Entrar para alterar dados">Entrar</button>
        <button *ngIf="(isAuth$ | async)" class="logout" (click)="onLogout($event)" title="Encerrar sessão com segurança">Sair</button>
      </div>
    </div>
  `,
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  isAuth$ = this.auth.isAuthenticated$;
  username$ = this.auth.username$;

  onLogout(ev?: Event): void {
    ev?.preventDefault();
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }

  onLogin(ev?: Event): void {
    ev?.preventDefault();
    const returnUrl = this.router.url || '/home';
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
