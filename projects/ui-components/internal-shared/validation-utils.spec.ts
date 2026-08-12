// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { FormControl } from '@angular/forms';
import { ValidationUtils } from './validation-utils';

describe('ValidationUtils', () => {
  it('should create an instance', () => {
    expect(new ValidationUtils()).toBeTruthy();
  });

  it('should create generalRegexValidator that tests regex pattern', () => {
    const twoDigitRegex = new RegExp('^[0-9]{2}[:.,-]?$');
    const validator = ValidationUtils.generalRegexValidator(twoDigitRegex, 'twoDigit');
    const goodFC: FormControl = new FormControl('12', [validator]);
    const badFC: FormControl = new FormControl('123', [validator]);
    expect(goodFC.hasError('twoDigit')).toBe(false);
    expect(badFC.hasError('twoDigit')).toBeTruthy();
  });

  it('should not skip validation for a falsy-but-present value like the number 0', () => {
    const twoDigitRegex = new RegExp('^[0-9]{2}[:.,-]?$');
    const regexValidator = ValidationUtils.generalRegexValidator(twoDigitRegex, 'twoDigit');
    const regexFC: FormControl = new FormControl(0, [regexValidator]);
    expect(regexFC.hasError('twoDigit')).toBe(true);

    const numericValidator = ValidationUtils.numericValidator('>=10 AND <=99');
    const numericFC: FormControl = new FormControl(0, [numericValidator]);
    expect(numericFC.hasError('numeric')).toBe(true);
  });

  it('should create requiredValidator that tests if the input is empty spaces', () => {
    const validator = ValidationUtils.requiredValidator();
    let formControl: FormControl = new FormControl('', [validator]);
    expect(formControl.hasError('required')).toBe(true);

    formControl = new FormControl('  ', [validator]);
    expect(formControl.hasError('required')).toBe(true);

    formControl = new FormControl(null, [validator]);
    expect(formControl.hasError('required')).toBe(true);

    formControl = new FormControl(undefined, [validator]);
    expect(formControl.hasError('required')).toBe(true);

    formControl = new FormControl('123', [validator]);
    expect(formControl.hasError('required')).toBe(false);
  });
});
