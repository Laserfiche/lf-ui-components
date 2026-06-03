// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { FieldFormat, FieldType } from '@laserfiche/lf-ui-components/shared';
import { ValidationRule, ValidationUtils } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable, of } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'lf-number-field-component',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: NumberFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    provideNgxMask(),
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    DynamicFieldComponent,
  ],
})
export class NumberFieldComponent extends BaseFieldDirective implements OnInit, AfterViewInit {
  private readonly NUMBER_FIELD_MUST_BE_VALID_NUMBER = this.localizationService.getStringLaserficheObservable(
    'NUMBER_FIELD_MUST_BE_VALID_NUMBER'
  );
  private readonly SHORT_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_64999 =
    this.localizationService.getStringLaserficheObservable('SHORT_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_64999');
  private readonly LONG_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_3999999999 =
    this.localizationService.getStringLaserficheObservable('LONG_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_3999999999');

  prefix: string | undefined;
  suffix: string | undefined;
  mask: string | undefined;
  thousandSeparator: string | undefined;
  decimalMarker: '.' | ',' | undefined;
  separatorLimit: string | undefined;
  focusState: boolean | undefined;

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
    if (this.lf_field_info.fieldType === FieldType.Number) {
      this.lf_field_form_control.setValue('');
    } else {
      const currentValue = this.lf_field_form_control.value;
      this.lf_field_form_control.setValue(currentValue ?? '');
    }
  }

  override onValueChanged(emitEvent: boolean = true) {
    const rawValue = this.lf_field_form_control.value;
    if (typeof rawValue === 'number' && isNaN(rawValue)) {
      this.setLfFieldFormControlValue('0');
      this.lf_field_value = '0';
      if (emitEvent) {
        this.fieldValueChange.emit(this.lf_field_value);
      }
      return;
    }
    super.onValueChanged(emitEvent);
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    validators.push(this.getNumericValidator());
    return validators;
  }

  getValidationTextForFieldType(rule: ValidationRule): Observable<string> | undefined {
    switch (rule) {
      case ValidationRule.NUMERIC:
        return this.lf_field_info.constraintError ? of(this.lf_field_info.constraintError) : undefined;
      case ValidationRule.NUMBER:
        return this.NUMBER_FIELD_MUST_BE_VALID_NUMBER;
      case ValidationRule.SHORT_INT:
        return this.SHORT_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_64999;
      case ValidationRule.LONG_INT:
        return this.LONG_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_3999999999;
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
        const numberPattern = new RegExp(
          `^(|[-](\\d{0,12}(\\` +
            decimalSeparator +
            `\\d{0,5})?|\\d{13}(\\` +
            decimalSeparator +
            `\\d{0,4})?)|[\\+]?\\d{0,13}(\\` +
            decimalSeparator +
            `\\d{0,5})?${tokenRegexString})$`,
          'i'
        );
        return ValidationUtils.generalRegexValidator(numberPattern, ValidationRule.NUMBER);
    }
  }

  numberOnly(event: KeyboardEvent) {
    if (
      this.lf_field_info.fieldType === FieldType.ShortInteger ||
      this.lf_field_info.fieldType === FieldType.LongInteger
    ) {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(event.key) === -1) {
        event.preventDefault();
      }
    }
  }

  override getLfFieldFormControlValue(): string {
    const value = this.lf_field_form_control.value;
    if (value == null || value === '') return '';
    if (typeof value === 'number' && isNaN(value)) return '';
    return String(value);
  }

  serializeFieldFormControlValue(): string {
    const rawValue = this.lf_field_form_control.value;
    const currentValue = this.getLfFieldFormControlValue();
    if (currentValue === '-' || (typeof rawValue === 'number' && isNaN(rawValue))) {
      this.setLfFieldFormControlValue('0');
      return '0';
    }
    if (this.lf_field_info.fieldType === FieldType.Number) {
      const parsedNumber = Number.parseFloat(currentValue);
      if (!isNaN(parsedNumber)) {
        return parsedNumber.toString();
      }
    }
    if (
      this.lf_field_info.fieldType === FieldType.ShortInteger ||
      this.lf_field_info.fieldType === FieldType.LongInteger
    ) {
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

  private getSeparator(separatorType?: string): '.' | ',' {
    const numberWithGroupAndDecimalSeparator: number = 11111.1;
    const numberString = numberWithGroupAndDecimalSeparator.toLocaleString(navigator.language);
    const separators = numberString.replace(/1/g, '');
    if (separatorType === 'group') {
      return separators.slice(0, 1) as '.' | ',';
    } else {
      return separators.slice(1, 2) as '.' | ',';
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
