import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  styleUrls: ['./feedback-submission.component.css'],
})
export class FeedbackSubmissionComponent {
  @Input() isFeedback?: boolean;
  @ViewChild('uploadFile') inputFile?: ElementRef<HTMLInputElement>;

  imageUploaded?: File;
  feedbackImageBase64: string | undefined;
  uploadedImageSize: string | undefined;
  imageSizeLimitBytes: number = 2.9 * 1024 * 1024; // limit is 2.9MB
  isImageValid: boolean = false;
  imageUploadErrorMessage?: Observable<string>;

  localizedStrings = {
    FILE_TOO_LARGE: this.localizationService.getStringComponentsObservable('FILE_TOO_LARGE'),
    IMAGE_CORRUPTED_FORMAT_UNRECOGNIZED: this.localizationService.getStringComponentsObservable(
      'IMAGE_CORRUPTED_FORMAT_UNRECOGNIZED'
    ),
  };

  constructor(private localizationService: AppLocalizationService) {}

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
        this.imageUploadErrorMessage = undefined;
      } else {
        // TODO: disable submit or notify users that the image will not be submitted
        throw new ImageUploadError('ImageUploadErrorType.TooLarge', ImageUploadErrorType.TooLarge);
      }
    } catch (error: any) {
      let errorMessage: Observable<string>;
      if (error.name === ImageUploadError_name) {
        switch ((<ImageUploadError>error).imageUploadErrorType) {
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

  private formatBytes(bytes: number, decimals: number = 2): string {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
