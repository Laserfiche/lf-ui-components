import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  styleUrls: ['./feedback-submission.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
})
export class FeedbackSubmissionComponent {
  @Input() isFeedback?: boolean;

  readonly maxFeedbackLength: number = 2048;
  feedbackTextBox: string = '';
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
    UPLOAD_IMAGE_OPTIONAL: this.localizationService.getStringComponentsObservable('UPLOAD_IMAGE_OPTIONAL'),
    DRAG_SELECT_IMAGE: this.localizationService.getStringComponentsObservable('DRAG_SELECT_IMAGE'),
    REMOVE: this.localizationService.getStringLaserficheObservable('REMOVE'),
    BROWSE: this.localizationService.getStringLaserficheObservable('BROWSE'),
    YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK: this.localizationService.getStringComponentsObservable(
      'YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK'
    ),
    TELL_US_ABOUT_IDEA: this.localizationService.getStringComponentsObservable('TELL_US_ABOUT_IDEA'),

  };

  constructor(private localizationService: AppLocalizationService) {}

}
