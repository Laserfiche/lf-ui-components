import { NgModule } from '@angular/core';
import { LfPopupModalComponent } from './lf-popup-modal/lf-popup-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

/**
 * @internal
 * Not for public use
 */
@NgModule({
  declarations: [
    LfPopupModalComponent
  ],
  imports: [
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MatInputModule,
  ],
  exports: [
    LfPopupModalComponent
  ],
  bootstrap: [
    LfPopupModalComponent
  ]
})
export class LfModalsModule { }
