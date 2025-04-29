// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable, of } from 'rxjs';
import { DateTimeBaseFieldDirective } from '../base-field/datetime-base-field.directives';

@Component({
  selector: 'lf-date-time-field-component',
  templateUrl: './date-time-field.component.html',
  styleUrls: ['./date-time-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: DateTimeBaseFieldDirective, useExisting: DateTimeFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class DateTimeFieldComponent extends DateTimeBaseFieldDirective implements OnInit {
  private LOCALE_DATE_TIME: Observable<string> | undefined;

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    const defaultDateTime: string | undefined = this.getDateTimePickerDefaultDateValue();
    var defaultDateString: string | undefined = undefined;
    var defaultTimeString: string | undefined = undefined;
    const dateTimeSeparator = 'T';
    const dateTimeElements = defaultDateTime?.split(dateTimeSeparator);
    if (dateTimeElements && dateTimeElements.length == 2) {
      [defaultDateString, defaultTimeString] = dateTimeElements;
    }

    this.uniDateTimeSettings = {
      showLabel: false,
      readOnly: false,
      combinedDateTime: true,
      defaultDate: defaultDateString,
      defaultTimeOfDate: defaultTimeString,
    };
    this.uniDateTimeConfig = {
      storedValueDateFormat: this.internalDateFormat,
      storedValueTimeFormat: this.internalTimeFormat,
      storedValueDateTimeFormat: `{DATE}${dateTimeSeparator}{TIME}`,
      language: navigator.language,
      locale: navigator.language,
      setDisplayFormatByLocale: true,
      silent: false, // no internal strings and no custom error messages
    };
  }

  compareDateStrings = LfMetadataDatetimeUtils.compareDateStrings;

  serializeFieldFormControlValue(): string {
    return this.getLfFieldFormControlValue();
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? '';
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    if (
      this.lf_field_form_control.errors &&
      (ValidationRule.DATETIME_PICKER_PARSE in this.lf_field_form_control.errors ||
        ValidationRule.DATEPICKER_PARSE in this.lf_field_form_control.errors)
    ) {
      this.LOCALE_DATE_TIME = of(this.lf_field_form_control.errors[validationRuleName].dateTimeFormat);
      var errorMessage = this.localizationService.getStringLaserficheWithObservableParams(
        'DATE_TIME_FIELDS_MUST_BE_IN_FORMAT_0',
        [this.LOCALE_DATE_TIME]
      );
      switch (validationRuleName) {
        case ValidationRule.DATETIME_PICKER_PARSE:
          return errorMessage;
        case ValidationRule.DATEPICKER_PARSE:
          return errorMessage;
      }
    }
    return undefined;
  }
}
