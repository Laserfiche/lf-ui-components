import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FeedbackSubmissionComponent } from './feedback-submission.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { By } from '@angular/platform-browser';
import { AppLocalizationService, LfMessageToastTypes } from '@laserfiche/lf-ui-components/internal-shared';
import { of } from 'rxjs';

@Component({
  selector: 'lf-feedback-image-upload',
  template: '<p>Mock Image Attach Component</p>',
})
class MockFeedbackImageUploadComponent {}

describe('FeedbackSubmissionComponent', () => {
  let component: FeedbackSubmissionComponent;
  let fixture: ComponentFixture<FeedbackSubmissionComponent>;
  const localizeServiceMock: jasmine.SpyObj<AppLocalizationService> = jasmine.createSpyObj('localization', [
    'getStringLaserficheObservable',
    'getStringComponentsObservable',
  ]);
  localizeServiceMock.getStringLaserficheObservable.and.callFake((value: string) => {
    return of(value);
  });
  localizeServiceMock.getStringComponentsObservable.and.callFake((value: string) => {
    return of(value);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackSubmissionComponent, MockFeedbackImageUploadComponent],
      imports: [MatCheckboxModule],
      providers: [{ provide: AppLocalizationService, useValue: localizeServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackSubmissionComponent);
    component = fixture.componentInstance;
    component.shouldShowImageUpload = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if the feedback image upload emits error, should set toastMessages', () => {
    const mockImageUploadComponent = fixture.debugElement.query(By.directive(MockFeedbackImageUploadComponent));
    const testErrorMessage = 'test error';
    mockImageUploadComponent.triggerEventHandler('imageUploadError', testErrorMessage);
    expect(component.toastMessages).toEqual([
      {
        message: testErrorMessage,
        type: LfMessageToastTypes.Warning,

        noIcon: false,
        hideMessage: false,
      },
    ]);
  });

  it('if the feedback image upload emits feedbackImageBase64, should set feedbackImageBase64', () => {
    const mockImageUploadComponent = fixture.debugElement.query(By.directive(MockFeedbackImageUploadComponent));
    const testBase64 = 'test base64';
    mockImageUploadComponent.triggerEventHandler('feedbackImageBase64', testBase64);
    expect(component.feedbackImageBase64).toEqual(testBase64);
  });

  it('if textarea input changes, should emit feedbackTextChanged', () => {
    spyOn(component.feedbackTextChanged, 'emit');
    const textAreaInput = document.getElementsByTagName('textarea')[0];
    const testInput = 'test input';
    textAreaInput.value = testInput;
    textAreaInput.dispatchEvent(new Event('input'));
    expect(component.feedbackTextChanged.emit).toHaveBeenCalledWith(testInput);
    expect(component.feedbackLength).toEqual(testInput.length);
  });

  it('if is feedback, should display feedback string', () => {
    component.isFeedback = true;
    fixture.detectChanges();
    const feedbackDescription = fixture.debugElement.query(By.css('.lf-user-feedback-description'));
    expect(feedbackDescription.nativeElement.innerText).toBe('FOUND_SOMETHING_LIKE_DISLIKE_LET_US_KNOW');
    const textLabel = fixture.debugElement.query(By.css('.lf-text-label'));
    expect(textLabel.nativeElement.innerText).toBe('TELL_US_ABOUT_EXPERIENCE (REQUIRED)');
  });

  it('if is not feedback, should display suggestion string', () => {
    component.isFeedback = false;
    fixture.detectChanges();
    const feedbackDescription = fixture.debugElement.query(By.css('.lf-user-feedback-description'));
    expect(feedbackDescription.nativeElement.innerText).toBe(
      'DO_YOU_HAVE_IDEA_NEW_FEATURE_IMPROVEMENT_LOOK_FORWARD_TO_HEARING'
    );
    const textLabel = fixture.debugElement.query(By.css('.lf-text-label'));
    expect(textLabel.nativeElement.innerText).toBe('TELL_US_ABOUT_IDEA (REQUIRED)');
  });
});
