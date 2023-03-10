import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { StringUtils } from '@laserfiche/lf-js-utils';

import { FeedbackImageUploadComponent } from './feedback-image-upload.component';

describe('FeedbackImageUploadComponent', () => {
  let component: FeedbackImageUploadComponent;
  let fixture: ComponentFixture<FeedbackImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackImageUploadComponent ]
    })
    .compileComponents();

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
    const fileDropZone  = document.getElementsByClassName('file-drop-zone');
    expect(fileDropZone.length).toBe(1);
  });

  it('if there is a valid image attached, should show name and the preview of the image', fakeAsync(async () => {
    // query selector for the image preview and check the src attribute
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAADdSURBVDhPY7gZx/CfEkx9A24lMvy/Hsrw/6o3hAbx0dUgYwwDbkQy/L+TLfL/foUGmAbx0dUgYwwDLtkz/H+7seU/CIBoEB9dDTLGbsDmNogBQJp0AxwY/r9Z3wA2AESD+OhqkPEgN+DFgoz/p2QgYiB8PQwYrcmo6rEG4puNTWADvt068v/l4pb/bzdB8L0S5f/XAlHVYxhw0Zbh/7sdfWAD0MGzaeH/L9qhqscwAOTMe8VK/x93OmPgO5lC/6+Ho6rHMADkR5AzL7tiYpDmW0mo6jEMIBVTaADDfwCCFlxzktJ/YwAAAABJRU5ErkJggg==' // image data truncated for brevity 
    // const blob = new Blob([StringUtils.base64toString(base64Image)], { type: 'image/png' });
    const file = new File([atob(base64Image)], 'lf-16.png', { type: 'image/png' });
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    flush();
    fixture.detectChanges();
    console.log(component.imageUploaded);
    // upload the file through the browse button -> input
    // const inputElement = document.getElementsByTagName('input');
    // const fileList: FileList = {
    //   length: 1,
    //   item : (index: number) => file,
    // };
    // // fileList.item = (index: number) => file;
    // // inputElement[0].dispatchEvent(new InputEvent('change', {
    // //   inputType: 'file',
    // //   data: base64Image,
    // // }));
    // inputElement[0].files = fileList;
        // const event = { target: { files:
    //   item = () => file
    // } };
    // await component.onFileSelectedAsync(event as unknown as InputEvent);


  }));

  fit('if the image attached is above 2.9MB, should emit warning', fakeAsync(async () => {
    const file = new File([''], 'big-file.png');
    Object.defineProperty(
      file, 'size', {value: 3*Math.pow(1024, 3), writable: false});

    spyOn(component.imageUploadError, 'emit');
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    expect(component.imageUploadError.emit).toHaveBeenCalledWith('Image not attached. The image exceeds the maximum file size of 2.9 MB.')
  }));

  fit('if the image attached is not a valid image, should emit warning', fakeAsync(async () => {
    const file = new File([''], 'invalid-file.png');

    spyOn(component.imageUploadError, 'emit');
    // @ts-ignore
    await component.tryReadAndValidateImageAsync(file);
    expect(component.imageUploadError.emit).toHaveBeenCalledWith('Image not attached. The image is corrupted or in an unrecognized format.')

  }));

  it('if multiple images are dropped to the file drop zone, should emit warning', () =>{

  });

  it('can upload image using the browse button', () => {});

  it('can upload image by dropping the image in the drop zone', () => {});


  it('if remove the image, should show the file drop zone', () => {});


});
