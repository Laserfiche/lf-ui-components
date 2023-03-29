import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfToastMessageComponent } from './lf-toast-message.component';
/**
 * @internal
 * Not for public use
 */
@NgModule({
  declarations: [LfToastMessageComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [LfToastMessageComponent],
  exports: [LfToastMessageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfToastMessageModule { }
