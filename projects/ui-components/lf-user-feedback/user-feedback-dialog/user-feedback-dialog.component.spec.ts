import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { By } from '@angular/platform-browser';
import { GeneralDialogLayoutModule } from '@laserfiche/lf-ui-components/internal-shared';
import { FeedbackSubmissionComponent } from '../feedback-submission/feedback-submission.component';
import { UserFeedbackDialogData, UserFeedbackTrackingEventType } from '../lf-user-feedback-types';
import { UserFeedbackDialogComponent } from './user-feedback-dialog.component';

@Component({
  selector: 'lf-feedback-suggestion-selection',
  template: '<p>Mock Feedback Suggestion Selection Component</p>',
})
class MockFeedBackSuggestionSelectionComponent {}

describe('UserFeedbackDialogComponent', () => {
  let component: UserFeedbackDialogComponent;
  let fixture: ComponentFixture<UserFeedbackDialogComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UserFeedbackDialogComponent,
        FeedbackSubmissionComponent,
        MockFeedBackSuggestionSelectionComponent,
      ],
      imports: [FormsModule, MatCheckboxModule, MatDialogModule, GeneralDialogLayoutModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFeedbackDialogComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  function goToFeedbackMode() {
    component.onClickFeedback();
    fixture.detectChanges();
    const submitFeedbackButton = element.querySelector('#lf-user-feedback-submit-feedback-button') as HTMLButtonElement;
    expect(submitFeedbackButton).toBeTruthy();
  }

  function triggerFeedbackTextChangedEventWith(textChange: string) {
    component.feedbackSubmission!.feedbackTextChanged.emit(textChange);
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isFeedback).toBeFalse();
    expect(component.isSuggestion).toBeFalse();
  });

  it('should go to feedback mode when feedback button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(
      By.directive(MockFeedBackSuggestionSelectionComponent)
    );
    mockFeedBackSuggestionSelection.triggerEventHandler('feedbackClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBeTrue();
    expect(component.isSuggestion).toBeFalse();
  });

  it('should go to suggestion mode when suggestion button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(
      By.directive(MockFeedBackSuggestionSelectionComponent)
    );
    mockFeedBackSuggestionSelection.triggerEventHandler('suggestionClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBeFalse();
    expect(component.isSuggestion).toBeTrue();
  });

  it('should disable submit button when textbox is empty', () => {
    goToFeedbackMode();
    triggerFeedbackTextChangedEventWith('');
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should disable submit button when textbox is whitespace', (done) => {
    goToFeedbackMode();
    const text = '     ';
    triggerFeedbackTextChangedEventWith(text);
    window.setTimeout(() => {
      expect(component.isSubmitDisabled).toBeTrue();
      // @ts-ignore
      expect(component.feedbackText).toBe(text);
      done();
    }, 350);
  });

  it('should enable submit button when textbox has non-whitespace value', (done) => {
    goToFeedbackMode();
    const text = 'Hello';
    triggerFeedbackTextChangedEventWith(text);
    window.setTimeout(() => {
      expect(component.isSubmitDisabled).toBeFalse();
      // @ts-ignore
      expect(component.feedbackText).toBe(text);
      done();
    }, 350);
  });

  it('should enable submit button when textbox has non-whitespace value and when email is disabled', (done) => {
    goToFeedbackMode();
    triggerFeedbackTextChangedEventWith('Hello');
    component.feedbackSubmission!.feedbackEmailCheckbox = false;
    window.setTimeout(() => {
      expect(component.isSubmitDisabled).toBeFalse();
      done();
    }, 350);
  });

  it('getFeedbackDialogData should get feedback dialog data', (done) => {
    goToFeedbackMode();
    const text = 'Hello';
    triggerFeedbackTextChangedEventWith(text);

    component.feedbackSubmission!.feedbackEmailCheckbox = false;
    const expectedDialogData: UserFeedbackDialogData = {
      canContact: component.feedbackSubmission!.feedbackEmailCheckbox,
      userFeedbackTrackingEventType: UserFeedbackTrackingEventType.Feedback,
      feedbackText: text,
      feedbackImageBase64: component.feedbackSubmission!.feedbackImageBase64,
    };
    window.setTimeout(() => {
      // @ts-ignore
      const dialogData = component.getFeedbackDialogData();
      expect(dialogData).toEqual(expectedDialogData);
      done();
    }, 350);
  });
});
