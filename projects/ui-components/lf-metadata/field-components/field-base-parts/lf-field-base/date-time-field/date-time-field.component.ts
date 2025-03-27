// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn, } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher  } from '@angular/material/core';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable } from 'rxjs';
import { LocaleDatetimeUtils } from '../locale-datetime-utils';
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
  private readonly LOCALE_DATE_TIME = this.localizationService.languageChanged().pipe(
    map((language) => {
      return LocaleDatetimeUtils.getLocaleDateTimePattern(language);
    })
  );
  private readonly DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0 =
    this.localizationService.getStringLaserficheWithObservableParams('DATE_TIME_FIELDS_MUST_BE_IN_FORMAT_0', [
      this.LOCALE_DATE_TIME,
    ]);


  constructor(
    public tokenService: LfFieldTokenService,

    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService
  ) {
    super(tokenService, ref, localizationService);
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
    switch (validationRuleName) {
      case ValidationRule.REQUIRED:
        return this.DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
      case ValidationRule.MAT_DATETIME_PICKER_PARSE:
        return this.DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
      case ValidationRule.MAT_DATEPICKER_PARSE:
        return this.DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
    }
    return undefined;
  }
}
