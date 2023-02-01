import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';

import { LfSelectionListComponent } from './lf-selection-list.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    LfSelectionListComponent,
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ScrollingModule,
    MatTableModule,
    MatSortModule
  ],
  bootstrap: [LfSelectionListComponent],
  exports: [LfSelectionListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

/** @internal */
export class LfSelectionListModule { }
