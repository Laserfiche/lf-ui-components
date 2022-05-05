import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfUserFeedbackComponent } from './lf-user-feedback.component';
import { UserFeedbackDialogComponent } from './user-feedback-dialog/user-feedback-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [LfUserFeedbackComponent, UserFeedbackDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [LfUserFeedbackComponent],
  exports: [LfUserFeedbackComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfUserFeedbackModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const elementName: string = 'lf-user-feedback';
    if (window.customElements && !customElements.get(elementName)) {
      const newElement = createCustomElement(LfUserFeedbackComponent, { injector });
      customElements.define(elementName, newElement);
    }
  }
}
