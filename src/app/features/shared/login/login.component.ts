import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="login-page">
      <mat-card class="glass-panel login-card">
        <mat-card-header>
          <mat-card-title>Entrar</mat-card-title>
          <mat-card-subtitle>Praxis UI Quickstart</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Usuário</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
            </mat-form-field>
            <div class="actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">Entrar</button>
            </div>
            <div class="hint">Use admin / changeMe! (dev)</div>
            <div class="error" *ngIf="error">Credenciais inválidas.</div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page { height: 100%; display:flex; align-items: center; justify-content: center; }
    .login-card { width: min(420px, 92vw); }
    .form { display:grid; gap: 12px; }
    .actions { display:flex; justify-content: flex-end; }
    .hint { opacity:.7; font-size:12px; }
    .error { color: #ff7b7b; }
  `]
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

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = false;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/operacoes/resumo';
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

