import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserFeedbackDialogComponent } from './user-feedback-dialog.component';

describe('UserFeedbackDialogComponent', () => {
  let component: UserFeedbackDialogComponent;
  let fixture: ComponentFixture<UserFeedbackDialogComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFeedbackDialogComponent],
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

  it('should go to feedback mode when feedback button is clicked', () => {
    const feedbackButton = element.querySelector('#lf-user-feedback-feedback-mode-button') as HTMLButtonElement;
    feedbackButton.click();
    expect(component.isFeedback).toBeTrue();
    expect(component.isSuggestion).toBeFalse();
  });

  it('should go to suggestion mode when suggestion button is clicked', () => {
    const suggestionButton = element.querySelector('#lf-user-feedback-suggestion-mode-button') as HTMLButtonElement;
    suggestionButton.click();
    expect(component.isFeedback).toBeFalse();
    expect(component.isSuggestion).toBeTrue();
  });

  it('should disable submit button when textbox is empty', () => {
    goToFeedbackMode();
    component.feedbackTextBox = '';
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should disable submit button when textbox is whitespace', () => {
    goToFeedbackMode();
    component.feedbackTextBox = '     ';
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should enable submit button when textbox has non-whitespace value', () => {
    goToFeedbackMode();
    component.feedbackTextBox = 'Hello';
    expect(component.isSubmitDisabled).toBeFalse();
  });

  it('should enable submit button when email is disabled', () => {
    goToFeedbackMode();
    component.feedbackTextBox = 'Hello';
    component.feedbackEmailCheckbox = false;
    expect(component.isSubmitDisabled).toBeFalse();
  });

});
