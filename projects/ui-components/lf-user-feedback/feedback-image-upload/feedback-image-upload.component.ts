import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';

/** @internal */
@Component({
  selector: 'lf-feedback-image-upload',
  templateUrl: './feedback-image-upload.component.html',
  styleUrls: ['./feedback-image-upload.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
})
export class FeedbackImageUploadComponent {
  @Output() imageUploadError: EventEmitter<string> = new EventEmitter<string>();
  @Output() feedbackImageBase64: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('uploadFile') inputFile?: ElementRef<HTMLInputElement>;

  imageUploaded?: File;
  rawImageBase64: string = '';  
  acceptedImageTypes: string = '.jpg,.jpeg,.png,.gif,.webp';
  private imageSizeLimitBytes: number = 2.9 * 1024 * 1024; // limit is 2.9MB
  private supportedImageTypes: string[] = this.acceptedImageTypes.split(',').map(imgType => imgType.replace('.','image/'));

  localizedStrings = {
    OR: this.localizationService.getStringComponentsObservable('OR'),
    ATTACH_IMAGE: this.localizationService.getStringComponentsObservable('ATTACH_IMAGE'),
    DRAG_DROP_FILE: this.localizationService.getStringComponentsObservable('DRAG_DROP_FILE'),
    REMOVE: this.localizationService.getStringLaserficheObservable('REMOVE'),
    BROWSE: this.localizationService.getStringLaserficheObservable('BROWSE'),
    OPTIONAL: this.localizationService.getStringComponentsObservable('OPTIONAL'),
    UNKNOWN_ERROR: this.localizationService.getStringLaserficheObservable('UNKNOWN_ERROR'),
  };
  constructor(private localizationService: AppLocalizationService) {
  }

  async dropHandler(ev: DragEvent): Promise<void> {
    let file: File | undefined;
    let numFiles = 0;
    ev.preventDefault();

    if (ev?.dataTransfer?.items) {
      numFiles = ev.dataTransfer.items.length;
      const item = ev.dataTransfer.items[0];
      if (item.kind === 'file') {
        file = item.getAsFile() ?? undefined;
      }
    } else {
      numFiles = ev.dataTransfer?.files.length ?? 0;
      file = ev.dataTransfer?.files.item(0) ?? undefined;
    }

    if (numFiles > 1) {
      this.imageUploadError.emit(
        this.localizationService.getResourceStringComponents('IMAGE_NOT_ATTACHED') +
          ' ' +
          this.localizationService.getResourceStringComponents('PLEASE_ATTACH_ONLY_ONE_IMAGE')
      );
    } else {
      await this.tryReadAndValidateImageAsync(file);
    }
  }

  dragOverHandler(ev: DragEvent) {
    ev.preventDefault();
  }

  private async tryReadAndValidateImageAsync(image: File | undefined): Promise<boolean> {
    if (!image) {
      return false;
    }
    try {
      const isImageSupported = this.supportedImageTypes.includes(image.type);
      if (!isImageSupported) {
        throw new ImageUploadError('ImageUploadErrorType.UnsupportedFormat', ImageUploadErrorType.UnsupportedFormat);
      }
      if (image.size <= this.imageSizeLimitBytes) {
        const encodingData = await this.getBase64Async(image);
        this.rawImageBase64 = encodingData;
        this.feedbackImageBase64.emit(encodingData?.split(',')[1]);
        this.imageUploaded = image;
        return true;
      } else {
        throw new ImageUploadError('ImageUploadErrorType.TooLarge', ImageUploadErrorType.TooLarge);
      }
    } catch (error: any) {
      let errorMessage: string;
      if (error.name === ImageUploadError_name) {
        switch ((<ImageUploadError>error).imageUploadErrorType) {
          case ImageUploadErrorType.TooLarge:
            errorMessage = this.localizationService.getResourceStringComponents('IMAGE_EXCEEDS_MAX_FILE_SIZE_2DOT9MB');
            break;
          case ImageUploadErrorType.UnsupportedFormat:
            errorMessage = this.localizationService.getResourceStringComponents('IMAGE_CORRUPTED_UNRECOGNIZED_FORMAT');
            errorMessage +=
              ' ' +
              this.localizationService.getResourceStringComponents('ACCEPTED_FORMATS_ARE_0', ['JPEG, PNG, GIF, WebP']);
            break;
          default:
            errorMessage = error.message ?? this.localizedStrings.UNKNOWN_ERROR;
            break;
        }
      } else {
        errorMessage = error.message ?? this.localizedStrings.UNKNOWN_ERROR;
      }
      this.imageUploadError.emit(
        this.localizationService.getResourceStringComponents('IMAGE_NOT_ATTACHED') + ' ' + errorMessage
      );
      this.imageUploaded = undefined;
    }
    return false;
  }

  onInputClickArea(): void {
    if (!this.inputFile) {
      console.warn('Input Element unexpectedly does not exist.');
      return;
    }
    this.inputFile.nativeElement.click();
  }

  async onFileSelectedAsync(event: InputEvent): Promise<void> {
    const file = (event.target as HTMLInputElement)?.files?.item(0) ?? undefined;
    const isFileAttached = await this.tryReadAndValidateImageAsync(file);
    if (!isFileAttached) {
      (event.target as HTMLInputElement).files = null;
      (event.target as HTMLInputElement).value = '';
    }
  }

  private async getBase64Async(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

      reader.onload = () => {
        const imgBase64: string = reader.result as string;
        var image = document.createElement('img');
        image.onload = () => {
          resolve(imgBase64);
        };
        image.onerror = (error) => {
          console.warn(error);
          reject(new ImageUploadError('ImageUploadErrorType.UnsupportedFormat', ImageUploadErrorType.UnsupportedFormat));
        };
        image.src = imgBase64;
      };
      reader.onerror = (error: any) => {
        console.warn(error);
        reject(new ImageUploadError('ImageUploadErrorType.UnsupportedFormat', ImageUploadErrorType.UnsupportedFormat));
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    this.imageUploaded = undefined;
  }
}

/** @internal */
enum ImageUploadErrorType {
  'TooLarge',
  'UnsupportedFormat',
}

/** @internal */
const ImageUploadError_name = 'ImageUploadError';
/** @internal */
class ImageUploadError extends Error {
  name = ImageUploadError_name;
  constructor(message: string, public imageUploadErrorType: ImageUploadErrorType) {
    super(message);
  }
}
