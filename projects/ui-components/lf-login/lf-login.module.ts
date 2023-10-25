// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfLoginComponent } from './lf-login.component';
import { MatMenuModule } from '@angular/material/menu';
import { createCustomElement } from '@angular/elements';


@NgModule({
  declarations: [
    LfLoginComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule
  ],
  bootstrap: [
    LfLoginComponent
  ],
  exports: [
    LfLoginComponent
  ]
})
export class LfLoginModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const elementName: string = 'lf-login';
    if (window.customElements && !customElements.get(elementName)) {
      const newElement = createCustomElement(LfLoginComponent, { injector });
      customElements.define(elementName, newElement);
    }
  }
}
