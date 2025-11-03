import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="login-page">
      <div class="auth-shell">
        <div class="glow-stage">
          <div class="glow glow-a"></div>
          <div class="glow glow-b"></div>
          <div class="glow glow-c"></div>
          <div class="noise"></div>
        </div>

        <div class="crumb">Dashboard</div>
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Entrar</mat-card-title>
            <mat-card-subtitle>Praxis UI Quickstart</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
              <mat-form-field appearance="fill">
                <mat-label>Usuário</mat-label>
                <input matInput formControlName="username" autocomplete="username" />
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Senha</mat-label>
                <input matInput type="password" formControlName="password" autocomplete="current-password" />
              </mat-form-field>
              <div class="actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">Entrar</button>
              </div>
              <div class="hint" *ngIf="!isProd">Use admin / changeMe! (dev)</div>
              <div class="error" *ngIf="error">Credenciais inválidas.</div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['auth-login.page.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = false;
  error = false;
  readonly isProd = environment.production;

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = false;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
    this.auth.login(this.form.getRawValue()).subscribe(ok => {
      this.loading = false;
      if (ok) {
        this.router.navigateByUrl(returnUrl);
      } else {
        this.error = true;
      }
    });
  }
}
