import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfLoaderComponent } from './lf-loader.component';

/**
 * @internal
 * Not for public use
 */
@NgModule({
  declarations: [LfLoaderComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [LfLoaderComponent],
  exports: [LfLoaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfLoaderModule { }
