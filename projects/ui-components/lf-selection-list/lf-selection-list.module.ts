// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';

import { LfSelectionListComponent } from './lf-selection-list.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
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
