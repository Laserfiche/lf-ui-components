// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { FieldFormat } from '@laserfiche/lf-ui-components/shared';
import { ValidationRule, ValidationUtils } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lf-time-field-component',
  templateUrl: './time-field.component.html',
  styleUrls: ['./time-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: TimeFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class TimeFieldComponent extends BaseFieldDirective implements OnInit {
  private timeDisplayFormat: string | undefined;
  private TIME_FIELDS_MUST_BE_IN_THE_FORMAT_0: Observable<string> | undefined;

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.timeDisplayFormat = this.getTimeFormat();
    this.TIME_FIELDS_MUST_BE_IN_THE_FORMAT_0 = this.localizationService.getStringLaserficheWithObservableParams(
      'TIME_FIELDS_MUST_BE_IN_FORMAT_0',
      [of(this.timeDisplayFormat)]
    );
    this.uniDateTimeSettings = {
      showLabel: false,
      readOnly: false,
      combinedDateTime: false,
      showTimeOnly: true,
      timeFormat: this.timeDisplayFormat,
      timePlaceholder: this.timeDisplayFormat,
    };

    this.uniDateTimeConfig = {
      storedValueTimeFormat: this.internalTimeFormat,
      storedValueDateTimeFormat: '{TIME}',
      language: navigator.language,
      silent: false, // no internal strings and no custom error messages
    };
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? ''; // TODO: check what format the API gives us Time in
  }

  serializeFieldFormControlValue(): string {
    return this.getLfFieldFormControlValue();
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    validators.push(ValidationUtils.createTimeValidator());
    return validators;
  }

  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    switch (validationRuleName) {
      case ValidationRule.TIME:
        return this.TIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
    }
    return undefined;
  }

  private getTimeFormat(): string {
    if (this.timeDisplayFormat)
    {
      return this.timeDisplayFormat;
    }
    switch (this.lf_field_info?.format) {
      case FieldFormat.ShortTime:
        return 'hh:mm A';
      case FieldFormat.LongTime:
        return 'hh:mm:ss A';
      default:
        return 'hh:mm:ss A';
    }
  }
  async onTimeValueChangedAsync() {
    if (this.containsToken) {
      this.lf_field_form_control.clearValidators();
    } else {
      this.resetToDefaultValidators();
    }
    super.onDateOrTimeTokenValueChanged();
    this.lf_field_form_control.updateValueAndValidity();
  }

  onTimeTokenChosen(token: string) {
    const newFieldVal: string = this.createNewFieldValueWithToken(token);
    if (this.tokenService.containsTokenForFieldType(newFieldVal, this.lf_field_info.fieldType, this.is_import_mode)) {
      this.lf_field_form_control.clearValidators();
      this.lf_field_form_control.updateValueAndValidity();
    }
    this.onTokenChosen(token);
  }
}
