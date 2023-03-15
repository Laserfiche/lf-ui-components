import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';

@Component({
  selector: 'lib-feedback-image-upload',
  templateUrl: './feedback-image-upload.component.html',
  styleUrls: ['./feedback-image-upload.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
})
export class FeedbackImageUploadComponent implements OnInit {
  @ViewChild('uploadFile') inputFile?: ElementRef<HTMLInputElement>;
  @Output() imageUploadError: EventEmitter<string> = new EventEmitter<string>();

  imageUploaded?: File;
  @Output() feedbackImageBase64: EventEmitter<string> = new EventEmitter<string>();
  imageSizeLimitBytes: number = 2.9 * 1024 * 1024; // limit is 2.9MB
  rawImageBase64: string = '';
  supportedImageTypes: string[] = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  localizedStrings = {
    OR: this.localizationService.getStringComponentsObservable('OR'),
    ATTACH_IMAGE_OPTIONAL: this.localizationService.getStringComponentsObservable('ATTACH_IMAGE_OPTIONAL'),
    DRAG_DROP_FILE: this.localizationService.getStringComponentsObservable('DRAG_DROP_FILE'),
    REMOVE: this.localizationService.getStringLaserficheObservable('REMOVE'),
    BROWSE: this.localizationService.getStringLaserficheObservable('BROWSE'),
  };
  constructor(private localizationService: AppLocalizationService) {}

  ngOnInit(): void {}

  async dropHandler(ev: DragEvent): Promise<void> {
    let file: File | undefined;
    let numFiles = 0;
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev?.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file
      numFiles = ev.dataTransfer.items.length;
      const item = ev.dataTransfer.items[0];
      if (item.kind === 'file') {
        file = item.getAsFile() ?? undefined;
      }
    } else {
      // Use DataTransfer interface to access the file(s)
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
    // Prevent default behavior (Prevent file from being opened)
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
            errorMessage = error.message;
            break;
        }
      } else {
        errorMessage = error.message;
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

  async getBase64Async(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

      reader.onload = () => {
        const imgBase64: string = reader.result as string;
        var image = document.createElement('img');
        image.onload = () => {
          resolve(imgBase64);
        };
        image.onerror = (error) => {
          reject(new ImageUploadError((error as string) ?? 'error event', ImageUploadErrorType.UnsupportedFormat));
        };
        image.src = imgBase64;
      };
      reader.onerror = (error: any) => {
        //TODO: is message the expected property?
        reject(new ImageUploadError(error?.message ?? 'error event', ImageUploadErrorType.UnsupportedFormat));
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    // this is to clear the selection of the input element
    this.imageUploaded = undefined;
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
