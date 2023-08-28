import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfUserFeedbackComponent } from './lf-user-feedback.component';
import { UserFeedbackDialogComponent } from './user-feedback-dialog/user-feedback-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { FeedbackSuggestionSelectionComponent } from './feedback-suggestion-selection/feedback-suggestion-selection.component';
import { FeedbackSubmissionComponent } from './feedback-submission/feedback-submission.component';
import { FeedbackImageUploadComponent } from './feedback-image-upload/feedback-image-upload.component';
import { MatIconModule } from '@angular/material/icon';
import { GeneralDialogLayoutModule, LfToastMessageModule, LfLoaderModule } from '@laserfiche/lf-ui-components/internal-shared';

@NgModule({
  declarations: [LfUserFeedbackComponent, UserFeedbackDialogComponent, FeedbackSuggestionSelectionComponent, FeedbackSubmissionComponent, FeedbackImageUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    GeneralDialogLayoutModule,
    LfToastMessageModule,
    LfLoaderModule,
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
