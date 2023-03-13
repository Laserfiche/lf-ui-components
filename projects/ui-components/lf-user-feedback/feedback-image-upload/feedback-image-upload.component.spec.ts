import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { StringUtils } from '@laserfiche/lf-js-utils';

import { FeedbackImageUploadComponent } from './feedback-image-upload.component';

describe('FeedbackImageUploadComponent', () => {
  let component: FeedbackImageUploadComponent;
  let fixture: ComponentFixture<FeedbackImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackImageUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if there is no image attached, should show the file drop zone', () => {
    // Act
    component.imageUploaded = undefined;

    // Assert
    const fileDropZone = document.getElementsByClassName('file-drop-zone');
    expect(fileDropZone.length).toBe(1);
  });

  it('if there is image attached, should show the picked file zone', () => {
    // Act
    component.imageUploaded = new File([''], 'test.png');
    fixture.detectChanges();

    // Assert
    const fileDropZone = document.getElementsByClassName('picked-file-zone');
    expect(fileDropZone.length).toBe(1);
  });

  it('if tryReadAndValidateImageAsync is called with a valid image, should should attach image, and should emit event feedbackImageBase64', fakeAsync(async () => {
    // Arrange
    const base64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    // convert base64 to byte array
    const file = base64ToImage(base64Image);
    spyOn(component.feedbackImageBase64, 'emit');
    // @ts-ignore

    // Act
    const success = await component.tryReadAndValidateImageAsync(file);
    fixture.detectChanges();

    // Assert
    expect(success).toBe(true);
    expect(component.feedbackImageBase64.emit).toHaveBeenCalledOnceWith(base64Image);
    expect(component.imageUploaded).toBe(file);
  }));

  it('if tryReadAndValidateImageAsync is called with a file above 2.9MB, should emit warning, and should not attach image', fakeAsync(async () => {
    // Arrange
    const fileSize = 3 * Math.pow(1024, 2); // 3 MB
    const file = createInvalidImageWithSize(fileSize);
    spyOn(component.imageUploadError, 'emit');

    // Act
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    fixture.detectChanges();

    // Assert
    expect(component.imageUploadError.emit).toHaveBeenCalledWith(
      'Image not attached. The image exceeds the maximum file size of 2.9 MB.'
    );
    expect(component.imageUploaded).toBe(undefined);
  }));

  it('if tryReadAndValidateImageAsync is called with an invalid image, should emit warning, and should not attach image', fakeAsync(async () => {
    // Arrange
    const fileSize = Math.pow(1024, 2); // 1 MB
    const file = createInvalidImageWithSize(fileSize);
    spyOn(component.imageUploadError, 'emit');

    // Act
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    fixture.detectChanges();

    // Assert
    expect(component.imageUploadError.emit).toHaveBeenCalledWith(
      'Image not attached. The image is corrupted or in an unrecognized format. The accepted formats are: JPEG, PNG, GIF, WebP.'
    );
    expect(component.imageUploaded).toBe(undefined);
  }));

  it('if multiple images are dropped to the file drop zone, should emit warning', () => {
    const file1 = new File([''], 'dummy1.png');
    const file2 = new File([''], 'dummy2.png');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file1);
    dataTransfer.items.add(file2);
    // @ts-ignore
    spyOn(component, 'tryReadAndValidateImageAsync').and.callThrough();

    const event = new DragEvent('drop', { dataTransfer });
    spyOn(component.imageUploadError, 'emit');

    component.dropHandler(event);
    fixture.detectChanges();
    // @ts-ignore
    expect(component.tryReadAndValidateImageAsync).not.toHaveBeenCalled();
    expect(component.imageUploadError.emit).toHaveBeenCalledWith('Image not attached. Please attach only one image.');
  });

  it('if one image is dropped to the file drop zone, should call tryReadAndValidateImageAsync', () => {
    const file1 = new File([''], 'dummy1.png');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file1);

    // @ts-ignore
    spyOn(component, 'tryReadAndValidateImageAsync').and.callThrough();

    const event = new DragEvent('drop', { dataTransfer });

    component.dropHandler(event);
    fixture.detectChanges();
    // @ts-ignore
    expect(component.tryReadAndValidateImageAsync).toHaveBeenCalledOnceWith(file1);
  });

  it('if remove the image, should show the file drop zone', async () => {

    // Arrange
    const base64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    // convert base64 to byte array
    const file = base64ToImage(base64Image);

    // Act
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    fixture.detectChanges();
    component.removeImage();
    fixture.detectChanges();

    // Assert
    expect(component.imageUploaded).toBe(undefined);
    expect(component.inputFile?.nativeElement.value).toBe('');
    expect(component.inputFile?.nativeElement.files?.length).toBe(0);
  });
});

function createInvalidImageWithSize(fileSize: number) {
  const file = new File([''], 'invalid-image.png');
  Object.defineProperty(file, 'size', { value: fileSize, writable: false });
  return file;
}

function base64ToImage(base64Image: string) {
  const asciiImage = StringUtils.base64toString(base64Image);
  const byteNumbers = new Array(asciiImage.length);
  for (let i = 0; i < asciiImage.length; i++) {
    byteNumbers[i] = asciiImage.charCodeAt(i);
  }
  // convert this array of byte values into a real typed byte array
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  const file = new File([blob], 'test.png', { type: 'image/png' });
  return file;
}
