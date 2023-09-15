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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfFieldTokenService } from './lf-field-token.service';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgxMaskModule } from 'ngx-mask';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { LfTokenPickerModule } from '../lf-token-picker/lf-token-picker.module';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatIconModule,
    LfTokenPickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatMomentDateModule,
    NgxMatMomentModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [
    LfFieldTokenService
  ],
  exports: [
    LfFieldBaseComponent,
    DateFieldComponent,
    DateTimeFieldComponent,
    ListFieldComponent,
    NumberFieldComponent,
    TextFieldComponent,
    TimeFieldComponent,
  ]
})
export class LfFieldBaseModule { }
