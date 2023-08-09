import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfToolbarComponent } from './lf-toolbar.component';
import { createCustomElement } from '@angular/elements';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [
    LfToolbarComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class LfToolbarModule {
    /** @internal */
    constructor(
      /** @internal */ injector: Injector
    ) {  
      const toolbarElementName: string = 'lf-toolbar';
      if (window.customElements && !customElements.get(toolbarElementName)) {
        const toolbarElement = createCustomElement(LfToolbarComponent, { injector });
        customElements.define(toolbarElementName, toolbarElement);
      }
  
    }
}
