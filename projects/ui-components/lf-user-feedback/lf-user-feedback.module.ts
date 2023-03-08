import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfUserFeedbackComponent } from './lf-user-feedback.component';
import { UserFeedbackDialogComponent } from './user-feedback-dialog/user-feedback-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { FeedbackSuggestionSelectionComponent } from './feedback-suggestion-selection/feedback-suggestion-selection.component';
import { FeedbackSubmissionComponent } from './feedback-submission/feedback-submission.component';
import { GeneralDialogLayoutComponent } from './general-dialog-layout/general-dialog-layout.component';
import { FeedbackImageUploadComponent } from './feedback-image-upload/feedback-image-upload.component';
import { LfToastMessageComponent } from './lf-toast-message/lf-toast-message.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [LfUserFeedbackComponent, UserFeedbackDialogComponent, FeedbackSuggestionSelectionComponent, FeedbackSubmissionComponent, GeneralDialogLayoutComponent, FeedbackImageUploadComponent, LfToastMessageComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule
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
