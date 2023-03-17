import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfToastMessageComponent } from './lf-toast-message.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
/**
 * @internal
 * Not for public use
 */
@NgModule({
  declarations: [LfToastMessageComponent],
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  providers: [],
  bootstrap: [LfToastMessageComponent],
  exports: [LfToastMessageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfToastMessageModule { }
