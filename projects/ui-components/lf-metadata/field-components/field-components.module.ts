// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfFieldComponent } from './lf-field/lf-field.component';
import { LfFieldMultivalueComponent } from './lf-field-multivalue/lf-field-multivalue.component';
import { LfFieldGroupComponent } from './lf-field-group/lf-field-group.component';
import { LfFieldBaseModule } from './field-base-parts/lf-field-base/lf-field-base.module';
import { LfLoaderModule } from '@laserfiche/lf-ui-components/internal-shared';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { LfFieldGroupIndexDisplayPipe } from './lf-field-group/lf-field-group-index-display.pipe';

@NgModule({
  declarations: [
    LfFieldComponent,
    LfFieldMultivalueComponent,
    LfFieldGroupComponent,
    LfFieldGroupIndexDisplayPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LfFieldBaseModule,
    LfLoaderModule,
    DragDropModule,
    MatIconModule,
  ],
  bootstrap: [
    LfFieldComponent,
    LfFieldMultivalueComponent,
    LfFieldGroupComponent
  ],
  exports: [
    LfFieldComponent,
    LfFieldMultivalueComponent,
    LfFieldGroupComponent
  ]
})
export class FieldComponentsModule { }
