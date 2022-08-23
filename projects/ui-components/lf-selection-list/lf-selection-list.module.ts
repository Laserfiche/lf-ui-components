import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { createCustomElement } from '@angular/elements';

import { LfSelectionListComponent } from './lf-selection-list.component';
import { LfListOptionComponent } from './lf-list-option.component';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    LfSelectionListComponent,
    LfListOptionComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ScrollingModule,

  ],
  bootstrap: [LfSelectionListComponent],
  exports: [LfSelectionListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

/** @internal */
export class LfSelectionListModule {
   /** @internal */
     constructor(
    /** @internal */ injector: Injector
  ) {}
}
