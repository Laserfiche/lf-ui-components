import { LocalizedString } from '@angular/compiler';
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
  imageUploadErrorMessage = new Observable<string>();

  get isSubmitDisabled(): boolean {
    return (
      this.isEmptyOrWhitespace(this.feedbackTextBox)
    );
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
    IMAGE_CORRUPTED_FORMAT_UNRECOGNIZED: this.localizationService.getStringComponentsObservable(
      'IMAGE_CORRUPTED_FORMAT_UNRECOGNIZED'
    ),
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

  async onFileSelectedAsync(event: Event): Promise<void> {

    // console.log(event);
    this.imageUploaded = this.inputFile?.nativeElement.files?.item(0) ?? undefined;
    await this.readAndValidateImageAsync();
  }

  async getBase64Async(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = () => {
        var image = document.createElement('img');
        image.onload = () => {
          const imgBase64: string = reader.result as string;
          resolve(imgBase64);
        };
        image.onerror = (error) => {
          console.error('invalid image: ', error);
          reject(new ImageUploadError((error as string) ?? 'error event', ImageUploadErrorType.UnsupportedFormat));
        };
        image.src = reader.result as string;
        //TODO: review the above cast
        // this.feedbackImageBase64 = reader.result as string;
      };
      reader.onerror = (error: any) => {
        //TODO: is message the expected property?
        reject(new ImageUploadError(error?.message ?? 'error event', ImageUploadErrorType.UnsupportedFormat));
        console.log('Error: ', error);
      };
      reader.readAsDataURL(file);
    });
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

  async dropHandler(ev: DragEvent): Promise<void> {
    let file: File | undefined;
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev?.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file
      const item = ev.dataTransfer.items[0];
      if (item.kind === 'file') {
        file = item.getAsFile() ?? undefined;
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      file = ev.dataTransfer?.files.item(0) ?? undefined;
    }
    this.imageUploaded = file;
    await this.readAndValidateImageAsync();
  }

  dragOverHandler(ev: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
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
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  private async readAndValidateImageAsync(): Promise<void> {
    if (!this.imageUploaded) {
      return;
    }
    this.uploadedImageSize = this.formatBytes(this.imageUploaded.size);
    try {
      if (this.imageUploaded.size <= this.imageSizeLimitBytes) {
        const encodingData = await this.getBase64Async(this.imageUploaded);
        this.feedbackImageBase64 = encodingData?.split(',')[1];
        // console.log(this.feedbackImageBase64); // TODO: remove
        this.isImageValid = true;
      } else {
        // TODO: disable submit or notify users that the image will not be submitted
        throw new ImageUploadError('ImageUploadErrorType.TooLarge', ImageUploadErrorType.TooLarge);
      }
    } catch (error: any) {
      let errorMessage: Observable<string>;
      if (error.name === ImageUploadError_name) {
        switch ((<ImageUploadError>error).imageUploadErrorType)
        {
          case ImageUploadErrorType.TooLarge:
            errorMessage = this.localizedStrings.FILE_TOO_LARGE;
            break;
          case ImageUploadErrorType.UnsupportedFormat:
            errorMessage = this.localizedStrings.IMAGE_CORRUPTED_FORMAT_UNRECOGNIZED;
            break;
          default:
            errorMessage = new Observable<string>(error.message);
            break;
        }
      } else {
        errorMessage = new Observable<string>(error.message);
      }
      console.log(error); // TODO: remove
      this.isImageValid = false;
      this.imageUploadErrorMessage = errorMessage;
    }
  }
}

enum ImageUploadErrorType {
  'TooLarge',
  'UnsupportedFormat',
}

const ImageUploadError_name = 'ImageUploadError';
class ImageUploadError extends Error {
  name = ImageUploadError_name;
  constructor(message: string, public imageUploadErrorType: ImageUploadErrorType) {
    super(message);
    // Set the prototype explicitly.
  }
}
