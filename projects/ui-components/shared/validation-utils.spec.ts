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

});
