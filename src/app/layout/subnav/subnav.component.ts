import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type SubnavItem = { label: string; link?: string; active?: boolean; external?: boolean };

@Component({
  selector: 'app-subnav',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, RouterLinkActive],
  template: `
    <nav class="subnav" *ngIf="(items?.length || 0) > 0" aria-label="Contextual navigation">
      <a
        *ngFor="let i of items"
        class="chip"
        [routerLink]="!i.external ? (i.link || null) : null"
        routerLinkActive="active"
        [attr.href]="i.external ? (i.link || '#') : null"
        [attr.target]="i.external ? '_blank' : null"
        [attr.rel]="i.external ? 'noopener' : null"
      >
        {{ i.label }}
      </a>
    </nav>
  `,
  styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent {
  @Input() items: SubnavItem[] = [];
}
