import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberFieldComponent } from './number-field.component';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CoreUtils } from '@laserfiche/lf-js-utils';

describe('NumberFieldComponent', () => {
  let numberComponent: NumberFieldComponent;
  let numberFixture: ComponentFixture<NumberFieldComponent>;
  let shortIntComponent: NumberFieldComponent;
  let shortIntFixture: ComponentFixture<NumberFieldComponent>;
  let longIntComponent: NumberFieldComponent;
  let longIntFixture: ComponentFixture<NumberFieldComponent>;

  const originalNumberVal: string = '';
  const originalShortVal: string = '1234567890';
  const originalLongVal: string = '12345';

  const testNumber: LfFieldInfo = {
    name: 'testNumberName',
    id: 1,
    description: 'testNumberDescription',
    isRequired: true,
    isMultiValue: false,
    fieldType: FieldType.Number,
    displayName: 'testNumberName'
  };

  const testShortInt: LfFieldInfo = {
    name: 'testShortIntName',
    id: 2,
    description: 'testShortIntDescription',
    isRequired: true,
    isMultiValue: false,
    fieldType: FieldType.ShortInteger,
    length: 3,
    displayName: 'testShortIntName'
  };

  const testLongInt: LfFieldInfo = {
    name: 'testLongIntName',
    id: 3,
    description: 'testLongIntDescription',
    isRequired: true,
    isMultiValue: false,
    fieldType: FieldType.LongInteger,
    displayName: 'testLongIntName'
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberFieldComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        NgxMaskPipe
      ],
      providers: [LfFieldTokenService, AppLocalizationService, provideNgxMask()]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    numberFixture = TestBed.createComponent(NumberFieldComponent);
    numberComponent = numberFixture.componentInstance;
    numberComponent.lf_field_info = testNumber;
    numberComponent.lf_field_value = originalNumberVal;
    numberComponent.lf_field_form_control = new FormControl();
    numberFixture.detectChanges();

    shortIntFixture = TestBed.createComponent(NumberFieldComponent);
    shortIntComponent = shortIntFixture.componentInstance;
    shortIntComponent.lf_field_info = testShortInt;
    shortIntComponent.lf_field_value = originalShortVal;
    shortIntComponent.lf_field_form_control = new FormControl();
    shortIntFixture.detectChanges();

    longIntFixture = TestBed.createComponent(NumberFieldComponent);
    longIntComponent = longIntFixture.componentInstance;
    longIntComponent.lf_field_info = testLongInt;
    longIntComponent.lf_field_value = originalLongVal;
    longIntComponent.lf_field_form_control = new FormControl();
    longIntFixture.detectChanges();
  });

  it('should create Number', () => {
    expect(numberComponent).toBeTruthy();
  });

  it('should create ShortInteger', () => {
    expect(shortIntComponent).toBeTruthy();
  });

  it('should create LongInteger', () => {
    expect(longIntComponent).toBeTruthy();
  });

  it('should validate an empty Number that is required', async () => {
    const expectedError = numberComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should validate a ShortInteger with invalid length and pattern', async () => {
    const lengthParam: string[] = [testShortInt?.length?.toString() ?? '0'];
    const expectedError: string = shortIntComponent.localizationService.getString('THIS_FIELD_HAS_MAXIMUM_ALLOWED_LENGTH_0_CHARACTERS', lengthParam);
    let value: string | undefined;
    shortIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should validate a valid LongInteger', async () => {
    let value: string | undefined;
    longIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should dynamically change Number value', async () => {
    numberComponent.setLfFieldFormControlValue('123');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should dynamically change ShortInteger value', async () => {
    shortIntComponent.setLfFieldFormControlValue('12');
    let value: string | undefined;
    shortIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should dynamically change LongInteger value', async () => {
    longIntComponent.setLfFieldFormControlValue('9999999999999999999999999999999999');
    const expectedError = longIntComponent.localizationService.getString('LONG_FIELDS_MUST_BE_INTEGERS_BETWEEN_0_3999999999');
    let value: string | undefined;
    longIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should serialize number (- => 0)', async () => {
    numberComponent.setLfFieldFormControlValue('-');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('0');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('0');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should serialize number (100 => 100)', async () => {
    numberComponent.setLfFieldFormControlValue('100');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('100');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('100');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should serialize number (400.1 => 400.1)', async () => {
    numberComponent.setLfFieldFormControlValue('400.1');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('400.1');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('400.1');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should serialize number (400.0 => 400)', async () => {
    numberComponent.setLfFieldFormControlValue('400.0');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('400');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('400.0');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should serialize number (-100 => -100)', async () => {
    numberComponent.setLfFieldFormControlValue('-100');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('-100');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('-100');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should return empty string lfFieldValue if value is not a number', async () => {
    numberComponent.setLfFieldFormControlValue('asdf');
    numberComponent.onValueChanged();
    expect(numberComponent.lf_field_value).toEqual('');
    expect(numberComponent.getLfFieldFormControlValue()).toEqual('asdf');
    const expectedError = numberComponent.localizationService.getString('NUMBER_FIELD_MUST_BE_VALID_NUMBER');
    let value: string | undefined;
    numberComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    numberComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should serialize valid short integer (200 => 200)', async () => {
    shortIntComponent.setLfFieldFormControlValue('200');
    shortIntComponent.onValueChanged();
    expect(shortIntComponent.lf_field_value).toEqual('200');
    expect(shortIntComponent.getLfFieldFormControlValue()).toEqual('200');
    let value: string | undefined;
    shortIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should return empty string lfFieldValue if value is not a short integer', async () => {
    shortIntComponent.setLfFieldFormControlValue('100000');
    shortIntComponent.onValueChanged();
    expect(shortIntComponent.lf_field_value).toEqual('');
    expect(shortIntComponent.getLfFieldFormControlValue()).toBe('100000');
  });

  it('should serialize valid long integer (300 => 300)', async () => {
    longIntComponent.setLfFieldFormControlValue('300');
    longIntComponent.onValueChanged();
    expect(longIntComponent.lf_field_value).toEqual('300');
    expect(longIntComponent.getLfFieldFormControlValue()).toEqual('300');
    let value: string | undefined;
    longIntComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longIntComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should return empty string lfFieldValue if value is not a long integer', async () => {
    longIntComponent.setLfFieldFormControlValue('4000000000');
    longIntComponent.onValueChanged();
    expect(longIntComponent.lf_field_value).toEqual('');
    expect(longIntComponent.getLfFieldFormControlValue()).toBe('4000000000');
  });

  it('should replace field value with token', async () => {
    const longIntField = '12345';
    longIntComponent.setLfFieldFormControlValue(longIntField);
    longIntFixture.detectChanges();

    const newValue = longIntComponent.createNewFieldValueWithToken('gcount');
    expect(newValue).toEqual('%(gcount)');
  });
});
