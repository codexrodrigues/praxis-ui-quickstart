import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { CrudDrawerBridgeService } from './crud-drawer-bridge.service';

@Component({
  selector: 'app-dynamic-form-drawer-host',
  standalone: true,
  imports: [CommonModule, PraxisDynamicForm],
  template: `
    <praxis-dynamic-form
      [formId]="ctx?.formId"
      [resourcePath]="ctx?.resourcePath"
      [resourceId]="ctx?.resourceId"
      [mode]="ctx?.mode || 'edit'"
      [backConfig]="ctx?.backConfig"
    ></praxis-dynamic-form>
  `,
})
export class DynamicFormDrawerHostComponent implements OnInit {
  private bridge = inject(CrudDrawerBridgeService);
  ctx = this.bridge.get();
  ngOnInit(): void { this.ctx = this.bridge.get(); }
}

