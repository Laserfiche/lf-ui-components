import { ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FeedbackSubmissionComponent } from './feedback-submission.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { By } from '@angular/platform-browser';
import { LfMessageToastTypes } from '../lf-toast-message/lf-toast-message.component';

@Component({
  selector: 'lf-feedback-image-upload',
  template: '<p>Mock Image Attach Component</p>',
})
class MockFeedbackImageUploadComponent {}

describe('FeedbackSubmissionComponent', () => {
  let component: FeedbackSubmissionComponent;
  let fixture: ComponentFixture<FeedbackSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackSubmissionComponent, MockFeedbackImageUploadComponent],
      imports: [MatCheckboxModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if the feedback image upload emits error, should set toastMessages',() => {
    const mockImageUploadComponent = fixture.debugElement.query(By.directive(MockFeedbackImageUploadComponent));
    const testErrorMessage = 'test error';
    mockImageUploadComponent.triggerEventHandler('imageUploadError', testErrorMessage);
    expect(component.toastMessages).toEqual([
      {
        message: testErrorMessage,
        type: LfMessageToastTypes.Warning,

        noIcon: false,
        hideMessage: false,
      }
    ]);
  });

  it('if the feedback image upload emits feedbackImageBase64, should set feedbackImageBase64',() => {
    const mockImageUploadComponent = fixture.debugElement.query(By.directive(MockFeedbackImageUploadComponent));
    const testBase64 = 'test base64';
    mockImageUploadComponent.triggerEventHandler('feedbackImageBase64', testBase64);
    expect(component.feedbackImageBase64).toEqual(testBase64);
  });

  it('if textarea input changes, should emit feedbackTextChanged',() => {
    spyOn(component.feedbackTextChanged, 'emit');
    const textAreaInput  = document.getElementsByTagName('textarea')[0];
    const testInput = 'test input';
    textAreaInput.value = testInput;
    textAreaInput.dispatchEvent(new Event('input'));
    expect(component.feedbackTextChanged.emit).toHaveBeenCalledWith(testInput);
    expect(component.feedbackLength).toEqual(testInput.length);
  });

  it('if is feedback, should display feedback string',() => {
    // TODO: mock localizationService and return the key
    component.isFeedback = true;
    fixture.detectChanges();
    const feedbackDescription = fixture.debugElement.query(By.css('.lf-user-feedback-description'));
    expect(feedbackDescription.nativeElement.innerText).toBe('Found something you like or dislike? Let us know about it.');
    const textLabel = fixture.debugElement.query(By.css('.lf-text-label'));
    expect(textLabel.nativeElement.innerText).toBe('Tell us about your experience');
  });

  it('if is not feedback, should display suggestion string',() => {
    // TODO: mock localizationService and return the key
    component.isFeedback = false;
    fixture.detectChanges();
    const feedbackDescription = fixture.debugElement.query(By.css('.lf-user-feedback-description'));
    expect(feedbackDescription.nativeElement.innerText).toBe('Do you have an idea for a new feature or an improvement? We look forward to hearing about it.');
    const textLabel = fixture.debugElement.query(By.css('.lf-text-label'));
    expect(textLabel.nativeElement.innerText).toBe('Tell us about your idea');
  });
});
