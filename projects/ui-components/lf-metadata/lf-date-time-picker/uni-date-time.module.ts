import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UniDateTimeComponent } from './uni-date-time.component';
import { MatInputModule } from '@angular/material/input';
import {
  UniComponentConfig,
  UniComponentSettings,
} from './uni-date-time.common';

@NgModule({
  declarations: [
    UniDateTimeComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
  ],
  exports: [
    UniDateTimeComponent,
  ]
})
export class LfUniDateTimeModule { }
export { UniDateTimeComponent, UniComponentSettings, UniComponentConfig };
