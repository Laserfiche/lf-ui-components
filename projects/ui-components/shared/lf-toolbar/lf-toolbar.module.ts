// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfToolbarComponent } from './lf-toolbar.component';
import { createCustomElement } from '@angular/elements';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
