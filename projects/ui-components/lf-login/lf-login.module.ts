import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfLoginComponent } from './lf-login.component';
import { MatMenuModule } from '@angular/material/menu';
import { createCustomElement } from '@angular/elements';


/** @internal */
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
