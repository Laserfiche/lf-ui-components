// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, Input, Output, EventEmitter, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  AppLocalizationService,
  LfMessageToastTypes,
  LfToastMessage,
  LfToastMessageComponent,
} from '@laserfiche/lf-ui-components/internal-shared';
import { FeedbackImageUploadComponent } from '../feedback-image-upload/feedback-image-upload.component';

/** @internal */
@Component({
  selector: 'lf-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  styleUrls: ['./feedback-submission.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, LfToastMessageComponent, FeedbackImageUploadComponent],
})
export class FeedbackSubmissionComponent {
  private localizationService = inject(AppLocalizationService);

  @Input() isFeedback?: boolean;
  @Output() feedbackTextChanged: EventEmitter<string> = new EventEmitter<string>();

  toastMessages: LfToastMessage[] = [];

  readonly maxFeedbackLength: number = 2048;
  feedbackLength: number = 0;
  feedbackEmailCheckbox: boolean = false;
  feedbackImageBase64: string | undefined;

  localizedStrings = {
    FOUND_SOMETHING_LIKE_DISLIKE_LET_US_KNOW: this.localizationService.getStringComponentsObservable(
      'FOUND_SOMETHING_LIKE_DISLIKE_LET_US_KNOW'
    ),
    DO_YOU_HAVE_IDEA_NEW_FEATURE_IMPROVEMENT_LOOK_FORWARD_TO_HEARING:
      this.localizationService.getStringComponentsObservable(
        'DO_YOU_HAVE_IDEA_NEW_FEATURE_IMPROVEMENT_LOOK_FORWARD_TO_HEARING'
      ),
    TELL_US_ABOUT_EXPERIENCE: this.localizationService.getStringComponentsObservable('TELL_US_ABOUT_EXPERIENCE'),
    PLEASE_DO_NOT_INCLUDE_CONFIDENTIAL_OR_PERSONAL_INFO_IN_FEEDBACK:
      this.localizationService.getStringComponentsObservable(
        'PLEASE_DO_NOT_INCLUDE_CONFIDENTIAL_OR_PERSONAL_INFO_IN_FEEDBACK'
      ),
    YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK: this.localizationService.getStringComponentsObservable(
      'YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK'
    ),
    TELL_US_ABOUT_IDEA: this.localizationService.getStringComponentsObservable('TELL_US_ABOUT_IDEA'),
    REQUIRED: this.localizationService.getStringLaserficheObservable('REQUIRED'),
  };

  onFeedbackImageBase64(imageBase64: string | undefined) {
    this.feedbackImageBase64 = imageBase64;
  }

  feedbackTextBoxChange(event: Event) {
    const feedbackText = (event.target as HTMLTextAreaElement).value;
    this.feedbackLength = feedbackText.length;
    this.feedbackTextChanged.emit(feedbackText);
  }

  onImageUploadError(errMsg: string) {
    const errorToastMsg: LfToastMessage = {
      message: errMsg,
      type: LfMessageToastTypes.Warning,
      noIcon: false,
      hideMessage: false,
    };
    this.toastMessages = [errorToastMsg];
  }
}
