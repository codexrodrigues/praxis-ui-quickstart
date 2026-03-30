import { ENVIRONMENT_INITIALIZER, type Provider } from '@angular/core';
import { ComponentMetadataRegistry, type ComponentDocMeta } from '@praxisui/core';
import { QuickstartEditorialWidgetComponent } from './quickstart-editorial-widget.component';

export const QUICKSTART_EDITORIAL_WIDGET_METADATA: ComponentDocMeta = {
  id: 'quickstart-editorial-runtime',
  componentType: 'quickstart-editorial-runtime',
  displayName: 'Quickstart Editorial Runtime',
  selector: 'app-quickstart-editorial-widget',
  component: QuickstartEditorialWidgetComponent,
  friendlyName: 'Quickstart Editorial Runtime',
  description: 'Host widget that wraps the Praxis editorial runtime for quickstart examples.',
  icon: 'auto_stories',
  tags: ['quickstart', 'editorial', 'runtime'],
  lib: 'praxis-ui-quickstart',
  inputs: [
    {
      name: 'input',
      type: 'EditorialRuntimeInput',
      description: 'Editorial runtime solution, instance, and runtime context passed by the quickstart host.',
    },
  ],
};

export function provideQuickstartEditorialWidgetMetadata(): Provider {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory: (registry: ComponentMetadataRegistry) => () => {
      registry.register(QUICKSTART_EDITORIAL_WIDGET_METADATA);
    },
    deps: [ComponentMetadataRegistry],
  } as Provider;
}
