// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { ValidatorFn } from '@angular/forms';
import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable, map, of } from 'rxjs';

@Component({
  selector: 'lf-date-field-component',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: DateFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class DateFieldComponent extends BaseFieldDirective implements OnInit {
  private LOCALE_DATE: Observable<string> | undefined;

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
      combinedDateTime: false,
      showTime: false,
    };
    this.uniDateTimeConfig = {
      storedValueDateFormat: this.internalDateFormat,
      storedValueDateTimeFormat: '{DATE}T00:00:00',
      language: navigator.language,
      locale: navigator.language,
      setDisplayFormatByLocale: true,
      silent: false, // no internal strings and no custom error messages
    };
  }

  compareDateStrings = LfMetadataDatetimeUtils.compareDateStrings;

  serializeFieldFormControlValue(): string {
    if (this.containsToken) {
      return this.getLfFieldFormControlValue();
    }
    const fieldControlValue = this.getLfFieldFormControlValue();
    if (!fieldControlValue) {
      return '';
    } else {
      const date: Date = new Date(fieldControlValue);
      const serializedDate: string = LfMetadataDatetimeUtils.serializeDateValue(date) ?? '';
      return serializedDate;
    }
  }

  deserializeLfFieldValue(): string {
    return LfMetadataDatetimeUtils.deserializeDateValue(this.lf_field_value);
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    switch (validationRuleName) {
      case ValidationRule.MAT_DATEPICKER_PARSE:
        if (
          this.lf_field_form_control.errors &&
          ValidationRule.MAT_DATEPICKER_PARSE in this.lf_field_form_control?.errors
        ) {
          this.LOCALE_DATE = of(this.lf_field_form_control.errors[ValidationRule.MAT_DATEPICKER_PARSE].dateTimeFormat);
          var errorMessage = this.localizationService.getStringLaserficheWithObservableParams(
            'DATE_FIELDS_MUST_BE_IN_FORMAT_0',
            [this.LOCALE_DATE]
          );
          return errorMessage;
        }
    }
    return undefined;
  }
}
