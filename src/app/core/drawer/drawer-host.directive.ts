import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appDrawerHost]' })
export class DrawerHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

