import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { LfTreeComponent } from './lf-tree.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { createCustomElement } from '@angular/elements';
import { LfLoaderModule } from '@laserfiche/laserfiche-ui-components/shared';


@NgModule({
  declarations: [
    LfTreeComponent
  ],
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatProgressBarModule,
    FormsModule,
    MatButtonModule,
    LfLoaderModule
  ],
  bootstrap: [LfTreeComponent],
  exports: [
    LfTreeComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfTreeModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const elementName: string = 'lf-tree';
    if (window.customElements && !customElements.get(elementName)) {
      const newElement = createCustomElement(LfTreeComponent, { injector });
      customElements.define(elementName, newElement);
    }
  }
}
