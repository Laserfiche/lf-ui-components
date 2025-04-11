// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFieldComponent } from './date-field/date-field.component';
import { DateTimeFieldComponent } from './date-time-field/date-time-field.component';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { LfFieldBaseComponent } from './lf-field-base/lf-field-base.component';
import { ListFieldComponent } from './list-field/list-field.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { TextFieldComponent } from './text-field/text-field.component';
import { TimeFieldComponent } from './time-field/time-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfFieldTokenService } from './lf-field-token.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { LfTokenPickerModule } from '../lf-token-picker/lf-token-picker.module';
import { UniDateTimeModule, UniDateTimeComponent } from "../../../lf-date-time-picker/uni-date-time.module";

@NgModule({
  declarations: [
    DateFieldComponent,
    DateTimeFieldComponent,
    DynamicFieldComponent,
    LfFieldBaseComponent,
    ListFieldComponent,
    NumberFieldComponent,
    TextFieldComponent,
    TimeFieldComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatIconModule,
    LfTokenPickerModule,
    NgxMaskDirective,
    NgxMaskPipe,
    UniDateTimeModule,
],
  providers: [
    LfFieldTokenService,
    provideNgxMask()
  ],
  exports: [
    LfFieldBaseComponent,
    DateFieldComponent,
    DateTimeFieldComponent,
    ListFieldComponent,
    NumberFieldComponent,
    TextFieldComponent,
    TimeFieldComponent,
    UniDateTimeComponent
  ]
})
export class LfFieldBaseModule { }
