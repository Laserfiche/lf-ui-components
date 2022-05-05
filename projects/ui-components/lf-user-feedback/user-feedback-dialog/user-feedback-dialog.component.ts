import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserFeedbackDialogData, UserFeedbackTrackingEventType } from '../lf-user-feedback-types';

/** @internal */
export enum FeedbackDialogState {
  FIRST_PANE,
  FEEDBACK,
  SUGGESTION,
  THANK_YOU,
  ERROR
}

/**
 * @internal
 */
@Component({
  selector: 'lf-user-feedback-dialog-component',
  templateUrl: './user-feedback-dialog.component.html',
  styleUrls: ['./user-feedback-dialog.component.css']
})
export class UserFeedbackDialogComponent implements AfterViewInit {

  @Output() submitFeedback: EventEmitter<UserFeedbackDialogData> = new EventEmitter();

  dialogState: FeedbackDialogState = FeedbackDialogState.FIRST_PANE;
  readonly maxFeedbackLength: number = 2048;
  feedbackTextBox: string = '';
  feedbackEmailCheckbox: boolean = false;

  get isSubmitDisabled(): boolean {
    return this.isEmptyOrWhitespace(this.feedbackTextBox);
  }

  get isFirstPane(): boolean { return this.dialogState === FeedbackDialogState.FIRST_PANE; }
  get isFeedback(): boolean { return this.dialogState === FeedbackDialogState.FEEDBACK; }
  get isSuggestion(): boolean { return this.dialogState === FeedbackDialogState.SUGGESTION; }
  get isThankYou(): boolean { return this.dialogState === FeedbackDialogState.THANK_YOU; }
  get isError(): boolean { return this.dialogState === FeedbackDialogState.ERROR; }

  get USER_FEEDBACK_TITLE(): string {
    if (this.isSuggestion) {
      return 'Suggestion';
    }
    return 'Feedback';
  }
  get USER_SUGGESTION_TITLE(): string { return 'Suggestion'; }
  get CLOSE(): string { return 'Close'; }
  get USER_FEEDBACK_DESCRIPTION(): string {
    return 'Your feedback and suggestions will help us improve our product and services.';
  }
  get SUPPORT_COMMENT(): string {
    return 'If you have a technical or support issue, or require immediate assistance,' +
      ' please contact your Laserfiche Administrator or Solution Provider as indicated' +
      ' in your service agreement.';
  }
  get FEEDBACK_DESCRIPTION(): string {
    return 'Found something you like or dislike? Let us know about it.';
  }
  get SUGGESTION_DESCRIPTION(): string {
    return 'Do you have an idea for a new feature or an improvement? We look forward to hearing about it.';
  }
  get FEEDBACK_SUGGESTION_TEXTBOX_PLACEHOLDER(): string {
    return 'Please do not include any confidential or personal information in your feedback';
  }
  get FEEDBACK_TEXBOX_LABEL(): string { return 'Tell us about your experience'; }
  get SUGGESTION_TEXBOX_LABEL(): string { return 'Tell us about your idea'; }
  get FEEDBACK_BUTTON_TEXT(): string { return 'I have feedback'; }
  get SUGGESTION_BUTTON_TEXT(): string { return 'I have a suggestion'; }
  get SHARE_EMAIL_CHECKBOX_TEXT(): string { return 'You may contact me about this feedback'; }
  get SUBMIT(): string { return 'Submit'; }
  get CANCEL(): string { return 'Cancel'; }
  get THANK_YOU(): string { return 'Thank you for your submission!'; }
  get SUBMISSION_ERROR(): string { return 'Something went wrong. Please try again later.'; }

  constructor(
    public dialogRef: MatDialogRef<UserFeedbackDialogComponent>,
    private ref: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    const elem = document.getElementById('lf-user-feedback-feedback-mode-button');
    elem?.focus();
  }

  setError(): void {
    this.dialogState = FeedbackDialogState.ERROR;
  }

  onClickFeedback(): void {
    this.dialogState = FeedbackDialogState.FEEDBACK;
    this.ref.detectChanges();
    document.getElementById('feedback-suggestion-textbox')?.focus();
  }

  onClickSuggestion(): void {
    this.dialogState = FeedbackDialogState.SUGGESTION;
    this.ref.detectChanges();
    document.getElementById('feedback-suggestion-textbox')?.focus();
  }

  async onClickSubmitAsync(): Promise<void> {
    const dialogData = this.getFeedbackDialogData();
    this.submitFeedback.emit(dialogData);
    if (!this.isError) {
      this.dialogState = FeedbackDialogState.THANK_YOU;
    }
  }

  private isEmptyOrWhitespace(value: string): boolean {
    return !(value.trim().length > 0);
  }

  private getFeedbackDialogData(): UserFeedbackDialogData {
    let userFeedbackTrackingEventType: UserFeedbackTrackingEventType = UserFeedbackTrackingEventType.Feedback;
    if (this.isSuggestion) {
      userFeedbackTrackingEventType = UserFeedbackTrackingEventType.Suggestion;
    }
    const dialogData: UserFeedbackDialogData = {
      canContact: this.feedbackEmailCheckbox,
      userFeedbackTrackingEventType,
      feedbackText: this.feedbackTextBox
    };
    return dialogData;
  }
}
