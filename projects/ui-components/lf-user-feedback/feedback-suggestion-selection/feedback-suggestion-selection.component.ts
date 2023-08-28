import { Component, EventEmitter, Output } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';

/** @internal */
@Component({
  selector: 'lf-feedback-suggestion-selection',
  templateUrl: './feedback-suggestion-selection.component.html',
  styleUrls: ['./feedback-suggestion-selection.component.css', '../user-feedback-dialog/user-feedback-dialog.component.css']
})
export class FeedbackSuggestionSelectionComponent {
  @Output() feedbackClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() suggestionClicked: EventEmitter<void> = new EventEmitter<void>();

  localizedStrings = {
    YOUR_FEEDBACK_SUGGESTION_HELP_IMPROVE_PRODUCT: this.localizationService.getStringComponentsObservable(
      'YOUR_FEEDBACK_SUGGESTION_HELP_IMPROVE_PRODUCT'
    ),
    TECHNICAL_ISSUES_CONTACT_ADMIN_OR_SP: this.localizationService.getStringComponentsObservable(
      'TECHNICAL_ISSUES_CONTACT_ADMIN_OR_SP'
    ),
    I_HAVE_FEEDBACK: this.localizationService.getStringComponentsObservable('I_HAVE_FEEDBACK'),
    I_HAVE_SUGGESTION: this.localizationService.getStringComponentsObservable('I_HAVE_SUGGESTION'),
  };

  constructor(
    private localizationService: AppLocalizationService
  ) { }

  onClickFeedback() {
    this.feedbackClicked.emit();
  }

  onClickSuggestion() {
    this.suggestionClicked.emit();
  }
}
