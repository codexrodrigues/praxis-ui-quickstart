import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FieldControlType, type MaterialCurrencyMetadata } from '@praxisui/core';
import {
  TextInputComponent,
  MaterialCurrencyComponent,
  MaterialDatepickerComponent,
  MaterialSelectComponent,
  MaterialTextareaComponent,
} from '@praxisui/dynamic-fields';
import {
  ManualFormComponent,
  ManualFieldEditorOnDblclickDirective,
} from '@praxisui/manual-form';
import { CustomizationModeService } from '../customization-mode.service';
import { MANUAL_FORM_SNIPPET, QUICKSTART_MANUAL_FORM_ID } from '../quickstart-content';

@Component({
  selector: 'app-manual-form-example-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    ManualFormComponent,
    ManualFieldEditorOnDblclickDirective,
    TextInputComponent,
    MaterialCurrencyComponent,
    MaterialDatepickerComponent,
    MaterialSelectComponent,
    MaterialTextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis Manual Form</p>
          <h1>Keep your own layout and still enable runtime customization</h1>
        </div>
        <mat-icon>dashboard_customize</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel panel--compact">
          <h2>What you can do</h2>
          <ul>
            <li>Keep full control of your HTML layout.</li>
            <li>Use Praxis field components instead of a schema-driven form shell.</li>
            <li>Turn customization on when you want to edit fields in runtime.</li>
          </ul>
        </article>

        <article class="panel panel--compact">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel panel--wide">
          <h2>Live example</h2>
          <p class="panel-copy">
            Build your own sections, cards, and spacing. The editor only joins the flow when
            customization is on.
          </p>

          <div class="runtime-panel">
            <praxis-manual-form
              class="profile-shell"
              [formGroup]="form"
              [formId]="formId"
              formTitle="Employee profile"
              formDescription="A custom layout with Praxis fields and runtime editing."
              [showActions]="false"
              [enableCustomization]="customizationEnabled()"
            >
              <section class="profile-hero">
                <div class="profile-intro">
                  <span class="profile-chip">Custom layout</span>
                  <h3>Design around your product, not around the form engine.</h3>
                  <p>
                    This layout is fully manual. The Praxis runtime only adds field metadata,
                    editing, and draft persistence.
                  </p>
                </div>

                <div class="profile-card">
                  <pdx-text-input
                    formControlName="name"
                    label="Name"
                    pdxManualEdit="name"
                  ></pdx-text-input>

                  <pdx-material-textarea
                    formControlName="summary"
                    label="Summary"
                    pdxManualEdit="summary"
                  ></pdx-material-textarea>
                </div>
              </section>

              <section class="details-grid">
                <article class="detail-card detail-card--accent">
                  <header>
                    <span class="detail-kicker">Choices</span>
                    <h3>Mix select and date fields into your own visual structure.</h3>
                  </header>

                  <div class="stacked-fields">
                    <pdx-material-select
                      #departmentField
                      formControlName="department"
                      pdxManualEdit="department"
                    ></pdx-material-select>

                    <pdx-material-datepicker
                      #startDateField
                      formControlName="startDate"
                      pdxManualEdit="startDate"
                    ></pdx-material-datepicker>
                  </div>
                </article>

                <article class="detail-card">
                  <header>
                    <span class="detail-kicker">Context</span>
                    <h3>Place text, currency, and supporting fields wherever the design asks.</h3>
                  </header>

                  <div class="stacked-fields">
                    <pdx-material-currency
                      formControlName="salary"
                      label="Salary"
                      [metadata]="salaryMetadata"
                      pdxManualEdit="salary"
                    ></pdx-material-currency>

                    <pdx-text-input
                      formControlName="location"
                      label="Location"
                      pdxManualEdit="location"
                    ></pdx-text-input>

                    <pdx-text-input
                      formControlName="team"
                      label="Team"
                      pdxManualEdit="team"
                    ></pdx-text-input>
                  </div>
                </article>
              </section>
            </praxis-manual-form>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .example-page { display:grid; gap:20px; }
    .back-link { color:var(--qs-example-link); text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2, .profile-intro h3, .detail-card h3 { margin:0; }
    .page-header h1, .panel h2, .profile-intro h3, .detail-card h3 { font-family:var(--font-display); color:var(--qs-example-title); }
    .page-grid { display:grid; gap:20px; }
    .panel { border:1px solid var(--qs-example-panel-border); padding:18px; background:var(--qs-example-panel-bg); box-shadow:var(--qs-example-panel-shadow); }
    .panel--compact { display:grid; gap:12px; }
    .panel--wide { display:grid; gap:12px; }
    .panel-copy { margin:0; color:var(--qs-example-muted); max-width:48rem; }
    .panel ul { margin:0; padding-left:20px; color:var(--qs-example-body); display:grid; gap:8px; }
    pre { margin:0; padding:16px; overflow:auto; background:var(--qs-example-code-bg); color:var(--qs-example-code-text); }
    .runtime-panel { border-top:1px dashed var(--qs-example-divider); padding-top:16px; }

    .profile-shell {
      --pdx-manual-form-gap: 18px;
      --pdx-manual-form-padding: 0;
      --pdx-manual-form-radius: 0;
      --pdx-manual-form-surface: transparent;
      --pdx-manual-form-outline: transparent;
      --pdx-manual-form-shadow: none;
      --manual-form-card-columns: repeat(2, minmax(0, 1fr));
    }

    .profile-hero {
      display:grid;
      grid-template-columns:var(--manual-form-card-columns);
      gap:18px;
      align-items:stretch;
    }

    .profile-intro,
    .profile-card,
    .detail-card {
      border:1px solid var(--qs-manual-card-border);
      border-radius:18px;
      background:var(--qs-manual-card-bg);
      box-shadow:var(--qs-manual-card-shadow);
    }

    .profile-intro {
      display:grid;
      gap:14px;
      padding:22px;
      background:var(--qs-manual-hero-bg);
    }

    .profile-intro p { margin:0; color:var(--qs-example-muted); line-height:1.5; max-width:34rem; }
    .profile-chip {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:max-content;
      min-height:32px;
      padding:6px 14px;
      border-radius:999px;
      background:var(--qs-example-chip-bg);
      color:var(--qs-example-chip-text);
      font-size:.76rem;
      font-weight:700;
      line-height:1;
      letter-spacing:.05em;
      text-transform:uppercase;
    }

    .profile-card {
      display:grid;
      gap:14px;
      padding:22px;
      background:var(--qs-manual-card-bg);
    }

    .profile-card > *,
    .stacked-fields > * {
      width: 100%;
      max-width: 100%;
      display: block;
    }

    .details-grid {
      display:grid;
      grid-template-columns:var(--manual-form-card-columns);
      gap:18px;
    }

    .detail-card {
      display:grid;
      gap:18px;
      padding:22px;
    }

    .profile-intro,
    .profile-card,
    .detail-card {
      height:100%;
    }

    .detail-card--accent {
      background:var(--qs-manual-accent-bg);
    }

    .detail-card header {
      display:grid;
      gap:8px;
    }

    .detail-card header p {
      margin:0;
    }

    .detail-kicker {
      color:var(--qs-manual-kicker);
      font-size:.76rem;
      font-weight:700;
      letter-spacing:.05em;
      text-transform:uppercase;
    }

    .stacked-fields {
      display:grid;
      gap:14px;
    }

    :host ::ng-deep .profile-card .mat-mdc-form-field,
    :host ::ng-deep .stacked-fields .mat-mdc-form-field {
      width: 100%;
      max-width: 100%;
    }

    @media (max-width: 900px) {
      .profile-shell {
        --manual-form-card-columns: 1fr;
      }

      .profile-hero,
      .details-grid {
        grid-template-columns:1fr;
      }
    }
  `],
})
export class ManualFormExamplePageComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly customizationMode = inject(CustomizationModeService);

  @ViewChild('departmentField') private departmentField?: MaterialSelectComponent;
  @ViewChild('startDateField') private startDateField?: MaterialDatepickerComponent;

  protected readonly snippet = MANUAL_FORM_SNIPPET;
  protected readonly formId = QUICKSTART_MANUAL_FORM_ID;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
  protected readonly salaryMetadata: MaterialCurrencyMetadata = {
    name: 'salary',
    label: 'Salary',
    controlType: FieldControlType.CURRENCY_INPUT,
    inputType: 'text',
    currency: 'USD',
  };
  protected readonly departmentMetadata = {
    name: 'department',
    label: 'Department',
    controlType: FieldControlType.SELECT,
    selectOptions: [
      { label: 'Platform', value: 'platform' },
      { label: 'Design', value: 'design' },
      { label: 'Operations', value: 'operations' },
    ],
  } as const;
  protected readonly startDateMetadata = {
    name: 'startDate',
    label: 'Start date',
    controlType: FieldControlType.DATE_PICKER,
    inputType: 'date',
    startAt: '2026-03-01',
  } as const;
  protected readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('Avery Stone', [Validators.required]),
    summary: this.fb.nonNullable.control(
      'Designs onboarding flows and keeps the platform experience aligned across products.',
    ),
    department: this.fb.nonNullable.control('platform'),
    startDate: this.fb.control<Date | null>(new Date(2026, 2, 10)),
    salary: this.fb.control<number | null>(185000),
    location: this.fb.nonNullable.control('Remote, US'),
    team: this.fb.nonNullable.control('Platform Experience'),
  });

  ngAfterViewInit(): void {
    this.departmentField?.setSelectMetadata(this.departmentMetadata);
    this.startDateField?.setDatepickerMetadata(this.startDateMetadata);
  }
}
