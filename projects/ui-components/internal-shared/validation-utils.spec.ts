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
    expect(goodFC.hasError('twoDigit')).toBeFalse();
    expect(badFC.hasError('twoDigit')).toBeTruthy();
  });

  it('should create requiredValidator that tests if the input is empty spaces', () => {

    const validator = ValidationUtils.requiredValidator();
    let formControl: FormControl = new FormControl('', [validator]);
    expect(formControl.hasError('required')).toBeTrue();

    formControl = new FormControl('  ', [validator]);
    expect(formControl.hasError('required')).toBeTrue();

    formControl = new FormControl(null, [validator]);
    expect(formControl.hasError('required')).toBeTrue();

    formControl = new FormControl(undefined, [validator]);
    expect(formControl.hasError('required')).toBeTrue();

    formControl = new FormControl('123', [validator]);
    expect(formControl.hasError('required')).toBeFalse();

  });

});
