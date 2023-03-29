import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralDialogLayoutComponent } from './general-dialog-layout.component';

/**
 * @internal
 * Not for public use
 */
@NgModule({
  declarations: [GeneralDialogLayoutComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [GeneralDialogLayoutComponent],
  exports: [GeneralDialogLayoutComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GeneralDialogLayoutModule { }
