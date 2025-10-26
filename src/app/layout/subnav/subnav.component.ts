import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type SubnavItem = { label: string; link?: string; active?: boolean };

@Component({
  selector: 'app-subnav',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, RouterLinkActive],
  template: `
    <nav class="subnav" *ngIf="(items?.length || 0) > 0" aria-label="Contextual navigation">
      <a
        *ngFor="let i of items"
        class="chip"
        [routerLink]="i.link || null"
        routerLinkActive="active"
        [attr.href]="i.link ? null : '#'"
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
