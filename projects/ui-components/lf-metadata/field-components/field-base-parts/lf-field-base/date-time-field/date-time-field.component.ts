// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable, of } from 'rxjs';
import { LfFieldTokenService } from '../lf-field-token.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lf-date-time-field-component',
  templateUrl: './date-time-field.component.html',
  styleUrls: ['./date-time-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: DateTimeFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class DateTimeFieldComponent extends BaseFieldDirective implements OnInit {
  private LOCALE_DATE_TIME: Observable<string> | undefined;

  constructor(
    public tokenService: LfFieldTokenService,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService
  ) {
    super(tokenService, ref, localizationService);
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.uniDateTimeSettings = {
      showLabel: false,
      readOnly: false,
      combinedDateTime: true,
    };
    this.uniDateTimeConfig = {
      storedValueDateFormat: this.internalDateFormat,
      storedValueTimeFormat: this.internalTimeFormat,
      storedValueDateTimeFormat: '{DATE}T{TIME}',
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
      (ValidationRule.MAT_DATETIME_PICKER_PARSE in this.lf_field_form_control.errors ||
        ValidationRule.MAT_DATEPICKER_PARSE in this.lf_field_form_control.errors)
    ) {
      this.LOCALE_DATE_TIME = of(this.lf_field_form_control.errors[validationRuleName].dateTimeFormat);
      var errorMessage = this.localizationService.getStringLaserficheWithObservableParams(
        'DATE_TIME_FIELDS_MUST_BE_IN_FORMAT_0',
        [this.LOCALE_DATE_TIME]
      );
      switch (validationRuleName) {
        case ValidationRule.MAT_DATETIME_PICKER_PARSE:
          return errorMessage;
        case ValidationRule.MAT_DATEPICKER_PARSE:
          return errorMessage;
      }
    }
    return undefined;
  }
}
