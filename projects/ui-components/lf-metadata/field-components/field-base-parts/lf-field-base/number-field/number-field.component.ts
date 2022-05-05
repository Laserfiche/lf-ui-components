import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { FieldFormat, FieldType, ValidationRule, ValidationUtils } from '@laserfiche/laserfiche-ui-components/shared';
import { AppLocalizationService } from '@laserfiche/laserfiche-ui-components/shared';
import { Observable, of } from 'rxjs';
import { LfFieldTokenService } from '../lf-field-token.service';

@Component({
  selector: 'lf-number-field-component',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: NumberFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class NumberFieldComponent extends BaseFieldDirective implements OnInit, AfterViewInit {
  private readonly NUMBER_FIELD_VALIDATOR_INVALID_MESSAGE = this.localizationService.getStringObservable('NUMBER_FIELD_VALIDATOR_INVALID_MESSAGE');
  private readonly SHORT_FIELD_VALIDATOR_INVALID_MESSAGE = this.localizationService.getStringObservable('SHORT_FIELD_VALIDATOR_INVALID_MESSAGE');
  private readonly LONG_FIELD_VALIDATOR_INVALID_MESSAGE = this.localizationService.getStringObservable('LONG_FIELD_VALIDATOR_INVALID_MESSAGE');

  prefix: string | undefined;
  suffix: string | undefined;
  mask: string | undefined;
  thousandSeparator: string | undefined;
  decimalMarker: string | undefined;
  separatorLimit: string | undefined;
  focusState: boolean | undefined;

  constructor(
    public tokenService: LfFieldTokenService,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService) {
    super(tokenService, ref, localizationService);
  }

  ngAfterViewInit() {
    this.setMaskForNumber();
  }

  onFocusIn() {
    this.focusState = true;
    this.ref.detectChanges();
  }

  onFocusOut() {
    this.focusState = false;
    this.ref.detectChanges();
  }

  onEveryInputChange() {
    this.ref.detectChanges();
    super.onValueChanged(false);
  }

  protected override fieldOnValueChanged(): void {
    const currentValue = this.lf_field_form_control.value;
    this.lf_field_form_control.setValue(currentValue ?? '');
  }


  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    validators.push(this.getNumericValidator());
    return validators;
  }

  getValidationTextForFieldType(rule: ValidationRule): Observable<string> | undefined {
    switch(rule) {
      case ValidationRule.NUMERIC:
        return this.lf_field_info.constraintError ? of(this.lf_field_info.constraintError) : undefined;
      case ValidationRule.NUMBER:
        return this.NUMBER_FIELD_VALIDATOR_INVALID_MESSAGE;
      case ValidationRule.SHORT_INT:
        return this.SHORT_FIELD_VALIDATOR_INVALID_MESSAGE;
      case ValidationRule.LONG_INT:
        return this.LONG_FIELD_VALIDATOR_INVALID_MESSAGE;
    }
    return undefined;
  }

  private getNumericValidator(): ValidatorFn {
    const tokenRegexString = ''; // TODO: token stuff
    const decimalSeparator = '.';
    switch (this.lf_field_info.fieldType) {
      case FieldType.ShortInteger:
        const shortIntPattern = new RegExp(`^(|[0-9]{0,4}|[0-5][0-9]{4}|[6][0-4][0-9]{3}${tokenRegexString})$`, 'i');
        return ValidationUtils.generalRegexValidator(shortIntPattern, ValidationRule.SHORT_INT);
      case FieldType.LongInteger:
        const longIntPattern = new RegExp(`^(|[0-9]{0,9}|[0-3][0-9]{9}${tokenRegexString})$`, 'i');
        return ValidationUtils.generalRegexValidator(longIntPattern, ValidationRule.LONG_INT);
      default:
        const numberPattern = new RegExp(`^(|[-](\\d{0,12}(\\` + decimalSeparator + `\\d{0,5})?|\\d{13}(\\` +
          decimalSeparator + `\\d{0,4})?)|[\\+]?\\d{0,13}(\\` + decimalSeparator + `\\d{0,5})?${tokenRegexString})$`, 'i');
        return ValidationUtils.generalRegexValidator(numberPattern, ValidationRule.NUMBER);
    }
  }

  numberOnly(event: KeyboardEvent) {
    if (this.lf_field_info.fieldType === FieldType.ShortInteger || this.lf_field_info.fieldType === FieldType.LongInteger) {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(event.key) === -1) {
        event.preventDefault();
      }
    }
  }

  serializeFieldFormControlValue(): string {
    const currentValue = this.getLfFieldFormControlValue();
    if (currentValue === '-') {
      this.setLfFieldFormControlValue('0');
      return '0';
    }
    if (this.lf_field_info.fieldType === FieldType.Number) {
      const parsedNumber = Number.parseFloat(currentValue);
      if (!isNaN(parsedNumber)) {
        return parsedNumber.toString();
      }
    }
    if (this.lf_field_info.fieldType === FieldType.ShortInteger || this.lf_field_info.fieldType === FieldType.LongInteger) {
      const parsedNumber = Number.parseInt(currentValue, 10);
      if (!isNaN(parsedNumber)) {
        return parsedNumber.toString();
      }
    }
    return currentValue;
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? '';
  }

  private getSeparator(separatorType?: string): string {
    const numberWithGroupAndDecimalSeparator: number = 11111.1;
    const numberString = numberWithGroupAndDecimalSeparator.toLocaleString(navigator.language);
    const separators = numberString.replace(/1/g, '');
    if (separatorType === 'group') {
      return separators.slice(0, 1);
    }
    else {
      return separators.slice(1, 2);
    }
  }

  private setMaskForNumber() {
    if (this.lf_field_info.fieldType === FieldType.Number) {
      this.mask = 'separator.5';
      this.separatorLimit = '10000000000000'; // 10,000,000,000,000
      this.thousandSeparator = '';
      this.decimalMarker = this.getSeparator();
      if (this.lf_field_info.format === FieldFormat.Currency && this.lf_field_info.currency) {
        this.prefix = `${this.lf_field_info.currency} `;
        this.mask = 'separator.2';
        this.thousandSeparator = this.getSeparator('group');
      }
      if (this.lf_field_info.format === FieldFormat.Percent) {
        this.suffix = ' %';
      }
      this.ref.detectChanges();
    }
  }
}
