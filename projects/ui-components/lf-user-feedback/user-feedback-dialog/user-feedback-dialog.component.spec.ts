import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { UserFeedbackDialogComponent } from './user-feedback-dialog.component';

@Component({
  selector: 'lib-feedback-submission',
  template: '<p>Mock Feedback Submission Component</p>',
})
class MockFeedBackSubmissionComponent {}

@Component({
  selector: 'lib-feedback-suggestion-selection',
  template: '<p>Mock Feedback Suggestion Selection Component</p>',
})
class MockFeedBackSuggestionSelectionComponent {}

describe('UserFeedbackDialogComponent', () => {
  let component: UserFeedbackDialogComponent;
  let fixture: ComponentFixture<UserFeedbackDialogComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFeedbackDialogComponent, MockFeedBackSubmissionComponent, MockFeedBackSuggestionSelectionComponent],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFeedbackDialogComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  function goToFeedbackMode() {
    const feedbackButton = element.querySelector('#lf-user-feedback-feedback-mode-button') as HTMLButtonElement;
    feedbackButton.click();
    fixture.detectChanges();
    const submitFeedbackButton = element.querySelector('#lf-user-feedback-submit-feedback-button') as HTMLButtonElement;
    expect(submitFeedbackButton).toBeTruthy();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isFeedback).toBeFalse();
    expect(component.isSuggestion).toBeFalse();
  });

  fit('should go to feedback mode when feedback button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(By.directive(MockFeedBackSuggestionSelectionComponent));
    mockFeedBackSuggestionSelection.triggerEventHandler('feedbackClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBeTrue();
    expect(component.isSuggestion).toBeFalse();
  });

  fit('should go to suggestion mode when suggestion button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(By.directive(MockFeedBackSuggestionSelectionComponent));
    mockFeedBackSuggestionSelection.triggerEventHandler('suggestionClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBeFalse();
    expect(component.isSuggestion).toBeTrue();
  });

  fit('should disable submit button when textbox is empty', () => {
    goToFeedbackMode();
    const mockFeedbackSubmission = fixture.debugElement.query(By.directive(MockFeedBackSubmissionComponent));
    const textChange = '';
    mockFeedbackSubmission.triggerEventHandler('feedbackTextChanged', textChange);
    // component.feedbackSubmission.feedbackTextBox = '';
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should disable submit button when textbox is whitespace', () => {
    goToFeedbackMode();
    // component.feedbackTextBox = '     ';
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should enable submit button when textbox has non-whitespace value', () => {
    goToFeedbackMode();
    // component.feedbackTextBox = 'Hello';
    expect(component.isSubmitDisabled).toBeFalse();
  });

  it('should enable submit button when email is disabled', () => {
    goToFeedbackMode();
    // component.feedbackTextBox = 'Hello';
    // component.feedbackEmailCheckbox = false;
    expect(component.isSubmitDisabled).toBeFalse();
  });

});
