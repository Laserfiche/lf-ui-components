import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';

import { LfSelectionListComponent } from './lf-selection-list.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { ResizeColumnDirective } from './resize-column.directive';

@NgModule({
  declarations: [
    LfSelectionListComponent,
    ResizeColumnDirective,
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ScrollingModule,
    MatTableModule,
    MatSortModule
  ],
  bootstrap: [LfSelectionListComponent, ResizeColumnDirective],
  exports: [LfSelectionListComponent],
})

/** @internal */
export class LfSelectionListModule { }
