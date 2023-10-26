// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { LfTokenPickerComponent } from './lf-token-picker.component';

@NgModule({
  declarations: [LfTokenPickerComponent],
  imports: [
    CommonModule,
    MatMenuModule
  ],
  exports: [LfTokenPickerComponent]
})
export class LfTokenPickerModule { }
