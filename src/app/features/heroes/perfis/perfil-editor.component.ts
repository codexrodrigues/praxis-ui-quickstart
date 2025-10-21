import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <mat-card class="glass-panel">
      <mat-card-header>
        <mat-card-title>Edição de Perfil</mat-card-title>
        <mat-card-subtitle>ID: {{ id }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="salvar()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput [formControl]="nome">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Codinome</mat-label>
            <input matInput [formControl]="codinome">
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button mat-stroked-button color="primary" (click)="fechar()">Fechar</button>
        <button mat-flat-button color="primary" (click)="salvar()">Salvar</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`.form { display: grid; gap: 12px; }`]
})
export class PerfilEditorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get('id');
  nome = new FormControl('');
  codinome = new FormControl('');

  salvar() {
    // TODO: chamada de API para persistir
    this.fechar();
  }

  fechar() {
    this.router.navigate([{ outlets: { aside: null } }], { relativeTo: this.route.root });
  }
}

