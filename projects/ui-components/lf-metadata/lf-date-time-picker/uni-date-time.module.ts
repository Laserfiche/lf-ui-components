import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UniDateTimeComponent } from './uni-date-time.component';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    UniDateTimeComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule
  ],
  exports: [
    UniDateTimeComponent
  ]
})
export class UniDateTimeModule { }
export { UniDateTimeComponent };
