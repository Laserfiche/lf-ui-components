import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { AppLocalizationService, LfMessageToastTypes, LfToastMessage } from '@laserfiche/lf-ui-components/internal-shared';

/** @internal */
@Component({
  selector: 'lf-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  styleUrls: ['./feedback-submission.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
})
export class FeedbackSubmissionComponent implements AfterViewInit {
  @Input() isFeedback?: boolean;
  @Output() feedbackTextChanged: EventEmitter<string> = new EventEmitter<string>();

  toastMessages: LfToastMessage[] = [];

  readonly maxFeedbackLength: number = 2048;
  feedbackLength: number = 0;
  feedbackEmailCheckbox: boolean = false;
  feedbackImageBase64: string | undefined;
  shouldShowImageUpload: boolean = false;

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

  constructor(private localizationService: AppLocalizationService) { }

  ngAfterViewInit() {
    if(window?.location?.href?.includes('clouddev')) {
      this.shouldShowImageUpload = true;
    }
  }

  onFeedbackImageBase64(imageBase64: string) {
    this.feedbackImageBase64 = imageBase64;
  }

  feedbackTextBoxChange(event: InputEvent) {
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
