import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UniDateTimeComponent } from './uni-date-time.component';

@NgModule({
  declarations: [
    UniDateTimeComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule
  ],
  exports: [
    UniDateTimeComponent
  ]
})
export class UniDateTimeModule { }
