import { Component } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { FieldFormat } from './../../../../../shared/lf-shared-public-api';
import { Observable } from 'rxjs';
import { LocaleDatetimeUtils } from '../locale-datetime-utils';
import { map } from 'rxjs/operators';
import { ValidationRule, ValidationUtils } from './../../../../../internal-shared/internal-shared-public-api';

@Component({
  selector: 'lf-time-field-component',
  templateUrl: './time-field.component.html',
  styleUrls: ['./time-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: TimeFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class TimeFieldComponent extends BaseFieldDirective {
  private readonly LOCALE_TIME = this.localizationService.languageChanged().pipe(map((language) => {
    return LocaleDatetimeUtils.getLocaleTimePattern(language);
  }));
  private readonly TIME_FIELDS_MUST_BE_IN_THE_FORMAT_0 = this.localizationService.getStringLaserficheWithObservableParams('TIME_FIELDS_MUST_BE_IN_FORMAT_0', [this.LOCALE_TIME]);

  step: string | undefined = '1'; // hh:mm:ss by default

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? ''; // TODO: check what format the API gives us Time in
  }

  serializeFieldFormControlValue(): string {
    return this.getLfFieldFormControlValue();
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    this.setTimeFormat();
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

  // Determines if format should contain seconds
  private setTimeFormat(): void {
    switch (this.lf_field_info?.format) {
      case FieldFormat.ShortTime:
        this.step = undefined; // hh:mm
        break;
      case FieldFormat.LongTime:
        this.step = '1'; // hh:mm:ss
        break;
      default:
        break;
    }
  }

  async onTimeValueChangedAsync() {
    if (this.containsToken) {
      this.lf_field_form_control.clearValidators();
    }
    else {
      this.resetToDefaultValidators();
    }
    this.lf_field_form_control.updateValueAndValidity();
    super.onValueChanged();
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
