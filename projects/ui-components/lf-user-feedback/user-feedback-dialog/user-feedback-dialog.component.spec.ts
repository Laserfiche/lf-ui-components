// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { FeedbackSubmissionComponent } from '../feedback-submission/feedback-submission.component';
import { FeedbackSuggestionSelectionComponent } from '../feedback-suggestion-selection/feedback-suggestion-selection.component';
import { UserFeedbackDialogData, UserFeedbackTrackingEventType } from '../lf-user-feedback-types';
import { UserFeedbackDialogComponent } from './user-feedback-dialog.component';

@Component({
  selector: 'lf-feedback-suggestion-selection',
  template: '<p>Mock Feedback Suggestion Selection Component</p>',
  standalone: true,
})
class MockFeedBackSuggestionSelectionComponent {}

describe('UserFeedbackDialogComponent', () => {
  let component: UserFeedbackDialogComponent;
  let fixture: ComponentFixture<UserFeedbackDialogComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatDialogModule,
        UserFeedbackDialogComponent,
        FeedbackSubmissionComponent,
        MockFeedBackSuggestionSelectionComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    })
      .overrideComponent(UserFeedbackDialogComponent, {
        remove: { imports: [FeedbackSuggestionSelectionComponent] },
        add: { imports: [MockFeedBackSuggestionSelectionComponent] },
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
    component.onClickFeedback();
    fixture.detectChanges();
    const submitFeedbackButton = element.querySelector('#lf-user-feedback-submit-feedback-button') as HTMLButtonElement;
    expect(submitFeedbackButton).toBeTruthy();
  }

  function triggerFeedbackTextChangedEventWith(textChange: string) {
    component.onFeedbackTextChanged(textChange);
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isFeedback).toBe(false);
    expect(component.isSuggestion).toBe(false);
  });

  it('should go to feedback mode when feedback button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(
      By.directive(MockFeedBackSuggestionSelectionComponent)
    );
    mockFeedBackSuggestionSelection.triggerEventHandler('feedbackClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBe(true);
    expect(component.isSuggestion).toBe(false);
  });

  it('should go to suggestion mode when suggestion button is clicked', () => {
    const mockFeedBackSuggestionSelection = fixture.debugElement.query(
      By.directive(MockFeedBackSuggestionSelectionComponent)
    );
    mockFeedBackSuggestionSelection.triggerEventHandler('suggestionClicked');
    fixture.detectChanges();
    expect(component.isFeedback).toBe(false);
    expect(component.isSuggestion).toBe(true);
  });

  it('should disable submit button when textbox is empty', () => {
    goToFeedbackMode();
    triggerFeedbackTextChangedEventWith('');
    expect(component.isSubmitDisabled).toBe(true);
  });

  it('should disable submit button when textbox is whitespace', () => {
    goToFeedbackMode();
    const text = '     ';
    triggerFeedbackTextChangedEventWith(text);
    expect(component.isSubmitDisabled).toBe(true);
  });

  it('should enable submit button when textbox has non-whitespace value', () => {
    goToFeedbackMode();
    const text = 'Hello';
    triggerFeedbackTextChangedEventWith(text);
    expect(component.isSubmitDisabled).toBe(false);
  });

  it('should enable submit button when textbox has non-whitespace value and when email is disabled', () => {
    goToFeedbackMode();
    triggerFeedbackTextChangedEventWith('Hello');
    component.feedbackSubmission!.feedbackEmailCheckbox = false;
    expect(component.isSubmitDisabled).toBe(false);
  });

  it('getFeedbackDialogData should get feedback dialog data', () => {
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
    }, 350);
  });
});
