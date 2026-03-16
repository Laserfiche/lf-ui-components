// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LocalizedString } from '@angular/compiler';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { AppLocalizationService, GeneralDialogLayoutComponent } from '@laserfiche/lf-ui-components/internal-shared';
import { debounceTime, map, Observable, Subscription } from 'rxjs';
import { FeedbackSubmissionComponent } from '../feedback-submission/feedback-submission.component';
import { FeedbackSuggestionSelectionComponent } from '../feedback-suggestion-selection/feedback-suggestion-selection.component';
import { UserFeedbackDialogData, UserFeedbackTrackingEventType } from '../lf-user-feedback-types';

/** @internal */
export enum FeedbackDialogState {
  FIRST_PANE,
  FEEDBACK,
  SUGGESTION,
  THANK_YOU,
  ERROR,
}

/**
 * @internal
 */
@Component({
  selector: 'lf-user-feedback-dialog-component',
  templateUrl: './user-feedback-dialog.component.html',
  styleUrls: ['./user-feedback-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    GeneralDialogLayoutComponent,
    FeedbackSubmissionComponent,
    FeedbackSuggestionSelectionComponent,
  ],
})
export class UserFeedbackDialogComponent implements AfterViewInit, OnDestroy {
  dialogRef = inject<MatDialogRef<UserFeedbackDialogComponent>>(MatDialogRef);
  private ref = inject(ChangeDetectorRef);
  private localizationService = inject(AppLocalizationService);

  @Output() submitFeedback: EventEmitter<UserFeedbackDialogData> = new EventEmitter();
  @ViewChild(FeedbackSubmissionComponent) feedbackSubmission?: FeedbackSubmissionComponent;

  private dialogState: FeedbackDialogState = FeedbackDialogState.FIRST_PANE;
  private feedbackText: string | undefined;
  private allSubscriptions: Subscription = new Subscription();
  isSubmitDisabled: boolean = true;

  get isFirstPane(): boolean {
    return this.dialogState === FeedbackDialogState.FIRST_PANE;
  }
  get isFeedback(): boolean {
    return this.dialogState === FeedbackDialogState.FEEDBACK;
  }
  get isSuggestion(): boolean {
    return this.dialogState === FeedbackDialogState.SUGGESTION;
  }
  get isThankYou(): boolean {
    return this.dialogState === FeedbackDialogState.THANK_YOU;
  }
  get isError(): boolean {
    return this.dialogState === FeedbackDialogState.ERROR;
  }

  localizedStrings = {
    SUGGESTION: this.localizationService.getStringLaserficheObservable('SUGGESTION'),
    FEEDBACK: this.localizationService.getStringLaserficheObservable('FEEDBACK'),
    CLOSE: this.localizationService.getStringLaserficheObservable('CLOSE'),
    THANK_YOU_FOR_SUBMISSION: this.localizationService.getStringLaserficheObservable('THANK_YOU_FOR_SUBMISSION'),
    IF_YOUD_LIKE_TO_JOIN_OUR_CUSTOMER_PANEL: this.localizationService
      .getStringComponentsObservable('IF_YOUD_LIKE_TO_JOIN_OUR_CUSTOMER_PANEL')
      .pipe(
        map((value: string) => {
          return `${value} `;
        })
      ),
    PLEASE_CLICK_HERE: this.localizationService.getStringComponentsObservable('PLEASE_CLICK_HERE'),
    SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER: this.localizationService.getStringLaserficheObservable(
      'SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER'
    ),
    SUBMIT: this.localizationService.getStringLaserficheObservable('SUBMIT'),
    CANCEL: this.localizationService.getStringLaserficheObservable('CANCEL'),
  };

  USER_FEEDBACK_TITLE: Observable<string> = this.localizedStrings.FEEDBACK;

  ngAfterViewInit() {
    const elem = document.getElementById('lf-user-feedback-feedback-mode-button');
    elem?.focus();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  setError(): void {
    this.dialogState = FeedbackDialogState.ERROR;
  }

  onClickFeedback(): void {
    this.dialogState = FeedbackDialogState.FEEDBACK;
    this.USER_FEEDBACK_TITLE = this.localizedStrings.FEEDBACK;
    setTimeout(() => document.getElementById('feedback-suggestion-textbox')?.focus());
    this.onTextChanges();
  }

  onClickSuggestion(): void {
    this.dialogState = FeedbackDialogState.SUGGESTION;
    this.USER_FEEDBACK_TITLE = this.localizedStrings.SUGGESTION;
    setTimeout(() => document.getElementById('feedback-suggestion-textbox')?.focus());
    this.onTextChanges();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKey(event: KeyboardEvent) {
    this.dialogRef.close();
  }

  private onTextChanges(): void {
    this.ref.detectChanges();
    const feedbackTextSub = this.feedbackSubmission?.feedbackTextChanged
      .asObservable()
      .pipe(debounceTime(250))
      .subscribe((text) => {
        this.feedbackText = text;
        this.isSubmitDisabled = this.isEmptyOrWhitespace(text);
      });
    this.allSubscriptions.add(feedbackTextSub);
  }

  async onClickSubmitAsync(): Promise<void> {
    try {
      const dialogData = this.getFeedbackDialogData();
      this.submitFeedback.emit(dialogData);
      if (!this.isError) {
        this.dialogState = FeedbackDialogState.THANK_YOU;
      }
    } catch (error: any) {
      console.warn(error.message);
      this.setError();
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  private isEmptyOrWhitespace(value: string | undefined): boolean {
    return !value || !(value.trim().length > 0);
  }

  private getFeedbackDialogData(): UserFeedbackDialogData {
    if (!this.feedbackSubmission || !this.feedbackText) {
      throw new Error('feedbackSubmission unexpectedly does not exist. Cannot submit');
    }
    let userFeedbackTrackingEventType: UserFeedbackTrackingEventType = UserFeedbackTrackingEventType.Feedback;
    if (this.isSuggestion) {
      userFeedbackTrackingEventType = UserFeedbackTrackingEventType.Suggestion;
    }
    const dialogData: UserFeedbackDialogData = {
      canContact: this.feedbackSubmission.feedbackEmailCheckbox,
      userFeedbackTrackingEventType,
      feedbackText: this.feedbackText,
      feedbackImageBase64: this.feedbackSubmission.feedbackImageBase64,
    };
    return dialogData;
  }
}
