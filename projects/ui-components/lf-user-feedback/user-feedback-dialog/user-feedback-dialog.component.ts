import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';
import { UserFeedbackDialogData, UserFeedbackTrackingEventType } from '../lf-user-feedback-types';

/** @internal */
export enum FeedbackDialogState {
  FIRST_PANE,
  FEEDBACK,
  SUGGESTION,
  THANK_YOU,
  ERROR,
}

/**
 * @internal
 */
@Component({
  selector: 'lf-user-feedback-dialog-component',
  templateUrl: './user-feedback-dialog.component.html',
  styleUrls: ['./user-feedback-dialog.component.css'],
})
export class UserFeedbackDialogComponent implements AfterViewInit {
  @Output() submitFeedback: EventEmitter<UserFeedbackDialogData> = new EventEmitter();
  @ViewChild('uploadFile') inputFile?: ElementRef<HTMLInputElement>;

  dialogState: FeedbackDialogState = FeedbackDialogState.FIRST_PANE;
  readonly maxFeedbackLength: number = 2048;
  feedbackTextBox: string = '';
  feedbackEmailCheckbox: boolean = false;
  feedbackImageBase64: string | undefined;
  imageUploaded?: File;
  uploadedImageSize: string | undefined;
  imageSizeLimitBytes: number = 2.9 * 1024 * 1024; // limit is 2.9MB
  isImageValid: boolean = false;

  get isSubmitDisabled(): boolean {
    return this.isEmptyOrWhitespace(this.feedbackTextBox);
  }

  get isFirstPane(): boolean {
    return this.dialogState === FeedbackDialogState.FIRST_PANE;
  }
  get isFeedback(): boolean {
    return this.dialogState === FeedbackDialogState.FEEDBACK;
  }
  get isSuggestion(): boolean {
    return this.dialogState === FeedbackDialogState.SUGGESTION;
  }
  get isThankYou(): boolean {
    return this.dialogState === FeedbackDialogState.THANK_YOU;
  }
  get isError(): boolean {
    return this.dialogState === FeedbackDialogState.ERROR;
  }

  localizedStrings = {
    SUGGESTION: this.localizationService.getStringLaserficheObservable('SUGGESTION'),
    FEEDBACK: this.localizationService.getStringLaserficheObservable('FEEDBACK'),
    CLOSE: this.localizationService.getStringLaserficheObservable('CLOSE'),
    YOUR_FEEDBACK_SUGGESTION_HELP_IMPROVE_PRODUCT: this.localizationService.getStringComponentsObservable(
      'YOUR_FEEDBACK_SUGGESTION_HELP_IMPROVE_PRODUCT'
    ),
    TECHNICAL_ISSUES_CONTACT_ADMIN_OR_SP: this.localizationService.getStringComponentsObservable(
      'TECHNICAL_ISSUES_CONTACT_ADMIN_OR_SP'
    ),
    FOUND_SOMETHING_LIKE_DISLIKE_LET_US_KNOW: this.localizationService.getStringComponentsObservable(
      'FOUND_SOMETHING_LIKE_DISLIKE_LET_US_KNOW'
    ),
    DO_YOU_HAVE_IDEA_NEW_FEATURE_IMPROVEMENT_LOOK_FORWARD_TO_HEARING:
      this.localizationService.getStringComponentsObservable(
        'DO_YOU_HAVE_IDEA_NEW_FEATURE_IMPROVEMENT_LOOK_FORWARD_TO_HEARING'
      ),
    PLEASE_DO_NOT_INCLUDE_CONFIDENTIAL_OR_PERSONAL_INFO_IN_FEEDBACK:
      this.localizationService.getStringComponentsObservable(
        'PLEASE_DO_NOT_INCLUDE_CONFIDENTIAL_OR_PERSONAL_INFO_IN_FEEDBACK'
      ),
    TELL_US_ABOUT_EXPERIENCE: this.localizationService.getStringComponentsObservable('TELL_US_ABOUT_EXPERIENCE'),
    TELL_US_ABOUT_IDEA: this.localizationService.getStringComponentsObservable('TELL_US_ABOUT_IDEA'),
    I_HAVE_FEEDBACK: this.localizationService.getStringComponentsObservable('I_HAVE_FEEDBACK'),
    I_HAVE_SUGGESTION: this.localizationService.getStringComponentsObservable('I_HAVE_SUGGESTION'),
    THANK_YOU_FOR_SUBMISSION: this.localizationService.getStringComponentsObservable('THANK_YOU_FOR_SUBMISSION'),
    YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK: this.localizationService.getStringComponentsObservable(
      'YOU_MAY_CONTACT_ME_ABOUT_FEEDBACK'
    ),
    IF_YOUD_LIKE_TO_JOIN_OUR_CUSTOMER_PANEL: this.localizationService.getStringComponentsObservable(
      'IF_YOUD_LIKE_TO_JOIN_OUR_CUSTOMER_PANEL'
    ),
    PLEASE_CLICK_HERE: this.localizationService.getStringComponentsObservable('PLEASE_CLICK_HERE'),
    SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER: this.localizationService.getStringComponentsObservable(
      'SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER'
    ),
    SUBMIT: this.localizationService.getStringLaserficheObservable('SUBMIT'),
    CANCEL: this.localizationService.getStringLaserficheObservable('CANCEL'),
    UPLOAD_FILE: this.localizationService.getStringComponentsObservable('UPLOAD_FILE'),
    REMOVE: this.localizationService.getStringLaserficheObservable('REMOVE'),
    FILE_TOO_LARGE: this.localizationService.getStringComponentsObservable('FILE_TOO_LARGE'),
    NO_IMAGE_UPLOADED: this.localizationService.getStringComponentsObservable('NO_IMAGE_UPLOADED'),
  };

  USER_FEEDBACK_TITLE: Observable<string> = this.localizedStrings.FEEDBACK;

  constructor(
    public dialogRef: MatDialogRef<UserFeedbackDialogComponent>,
    private ref: ChangeDetectorRef,
    private localizationService: AppLocalizationService
  ) {}

  ngAfterViewInit() {
    const elem = document.getElementById('lf-user-feedback-feedback-mode-button');
    elem?.focus();
  }

  setError(): void {
    this.dialogState = FeedbackDialogState.ERROR;
  }

  onClickFeedback(): void {
    this.dialogState = FeedbackDialogState.FEEDBACK;
    this.USER_FEEDBACK_TITLE = this.localizedStrings.FEEDBACK;
    this.ref.detectChanges();
    document.getElementById('feedback-suggestion-textbox')?.focus();
  }

  onClickSuggestion(): void {
    this.dialogState = FeedbackDialogState.SUGGESTION;
    this.USER_FEEDBACK_TITLE = this.localizedStrings.SUGGESTION;
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

  onInputClickArea(): void {
    if (!this.inputFile) {
      return;
    }
    this.inputFile.nativeElement.click();
  }

  async onFileSelectedAsync(): Promise<void> {
    this.imageUploaded = this.inputFile?.nativeElement.files?.item(0) ?? undefined;
    if (!this.imageUploaded)
    {
      return;
    }
    this.uploadedImageSize = this.formatBytes(this.imageUploaded.size);
    if (this.imageUploaded.size <= this.imageSizeLimitBytes) {
      this.isImageValid = true;
      const encodingData = await this.getBase64Async(this.imageUploaded);
      this.feedbackImageBase64 = encodingData?.split(',')[1];
      console.log(this.feedbackImageBase64); // TODO: remove
    }
    else{
      this.isImageValid = false;
      // TODO: disable submit or notify users that the image will not be submitted
    }

    // limit the image size <2.9m and do error handlings

  }

  async getBase64Async(file: File): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
        // this.feedbackImageBase64 = reader.result as string;
      };
      reader.onerror = (error) => {
        reject(reader.error);
        console.log('Error: ', error);
      };
      reader.readAsDataURL(file);
    });

    // TODO: remove header data:image/jpeg;base64,
    // decode and test
  }

  removeImage(): void {
    // this is to clear the selection of the input element
    this.isImageValid = false;
    if (!this.inputFile?.nativeElement.files) {
      return;
    }
    this.inputFile.nativeElement.files = null;
    this.imageUploaded = undefined;
    this.inputFile.nativeElement.value = '';
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
      feedbackText: this.feedbackTextBox,
      feedbackImageBase64: this.feedbackImageBase64,
    };
    return dialogData;
  }
  private formatBytes(bytes: number, decimals: number = 2): string {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
}
