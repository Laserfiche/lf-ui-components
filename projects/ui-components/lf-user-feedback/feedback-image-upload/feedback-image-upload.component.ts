// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLocalizationService, LfLoaderComponent } from '@laserfiche/lf-ui-components/internal-shared';

/** @internal */
@Component({
  selector: 'lf-feedback-image-upload',
  templateUrl: './feedback-image-upload.component.html',
  styleUrls: ['./feedback-image-upload.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, LfLoaderComponent],
})
export class FeedbackImageUploadComponent {
  private localizationService = inject(AppLocalizationService);
  private ref = inject(ChangeDetectorRef);

  @Output() imageUploadError: EventEmitter<string> = new EventEmitter<string>();
  @Output() feedbackImageBase64: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();

  showLoader: boolean = false;
  imageUploaded?: { name: string; rawBase64: string };
  acceptedImageTypes: string = '.jpg,.jpeg,.png,.gif,.webp';
  private acceptedImageFormats: string = 'JPEG, PNG, GIF, WebP';
  private supportedImageTypeArray: string[] = this.acceptedImageTypes
    .split(',')
    .map((imgType) => imgType.replace('.', 'image/'));
  private megabyteLimit = 3;
  private imageSizeLimitBytes: number = this.megabyteLimit * 1024 * 1024;

  localizedStrings: Record<string, string> = {};

  constructor() {
    const lfKeys = ['OR', 'DRAG_DROP_FILE', 'REMOVE', 'BROWSE', 'OPTIONAL', 'UNKNOWN_ERROR'];
    for (const key of lfKeys) {
      this.localizationService.getStringLaserficheObservable(key).subscribe((v) => {
        this.localizedStrings[key] = v as string;
      });
    }
    this.localizationService.getStringComponentsObservable('ATTACH_IMAGE').subscribe((v) => {
      this.localizedStrings['ATTACH_IMAGE'] = v as string;
    });
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
          this.localizationService.getResourceStringComponents('PLEASE_ATTACH_ONLY_ONE_IMAGE'),
      );
    } else {
      await this.tryReadAndValidateImageAsync(file);
    }
  }

  dragOverHandler(ev: DragEvent) {
    ev.preventDefault();
  }

  private async tryReadAndValidateImageAsync(image: File | undefined): Promise<boolean> {
    try {
      this.showLoader = true;
      this.ref.detectChanges();
      await this.uploadImageOrThrow(image);
    } catch (error: any) {
      this.handleImageUploadError(error);
    } finally {
      this.showLoader = false;
      this.ref.detectChanges();
      return !!this.imageUploaded;
    }
  }

  private async uploadImageOrThrow(image: File | undefined): Promise<void> {
    this.checkImageForErrors(image);
    const encodingData = await this.getBase64Async(image as File);
    this.feedbackImageBase64.emit(encodingData);
    this.imageUploaded = {
      name: (image as File).name,
      rawBase64: encodingData,
    };
    this.ref.detectChanges();
  }

  private checkImageForErrors(image: File | undefined): void {
    if (!image) {
      throw new Error('image does not exist');
    }
    const isImageSupported = this.supportedImageTypeArray.includes(image.type);
    if (!isImageSupported) {
      throw new ImageUploadError(ImageUploadErrorType.UnsupportedFormat);
    }
    if (image.size > this.imageSizeLimitBytes) {
      throw new ImageUploadError(ImageUploadErrorType.TooLarge);
    }
  }

  private handleImageUploadError(error: any): void {
    const errorMessage = this.getImageUploadErrorMessage(error);
    this.imageUploadError.emit(
      this.localizationService.getResourceStringComponents('IMAGE_NOT_ATTACHED') + ' ' + errorMessage,
    );
    this.feedbackImageBase64.emit(undefined);
    this.imageUploaded = undefined;
    this.ref.detectChanges();
  }

  private getImageUploadErrorMessage(error: any): string {
    if (error.name === ImageUploadError_name) {
      switch ((<ImageUploadError>error).imageUploadErrorType) {
        case ImageUploadErrorType.TooLarge:
          return this.localizationService.getResourceStringComponents('IMAGE_EXCEEDS_MAX_FILE_SIZE_0', [
            `${this.megabyteLimit} MB`,
          ]);
        case ImageUploadErrorType.UnsupportedFormat:
          return (
            this.localizationService.getResourceStringComponents('IMAGE_CORRUPTED_UNRECOGNIZED_FORMAT') +
            ' ' +
            this.localizationService.getResourceStringComponents('ACCEPTED_FORMATS_ARE_0', [this.acceptedImageFormats])
          );
        default:
          return error.message ?? this.localizedStrings.UNKNOWN_ERROR;
      }
    } else {
      return error.message ?? this.localizedStrings.UNKNOWN_ERROR;
    }
  }

  onInputClickArea(fileInput: HTMLInputElement): void {
    fileInput.click();
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
          reject(new ImageUploadError(ImageUploadErrorType.UnsupportedFormat));
        };
        image.src = imgBase64;
      };
      reader.onerror = (error: any) => {
        console.warn(error);
        reject(new ImageUploadError(ImageUploadErrorType.UnsupportedFormat));
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(fileInput?: HTMLInputElement): void {
    this.imageUploaded = undefined;
    this.feedbackImageBase64.emit(undefined);
    if (fileInput) {
      fileInput.value = '';
    }
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
  constructor(
    public imageUploadErrorType: ImageUploadErrorType,
    message?: string,
  ) {
    super(message ?? imageUploadErrorType.toString());
  }
}
