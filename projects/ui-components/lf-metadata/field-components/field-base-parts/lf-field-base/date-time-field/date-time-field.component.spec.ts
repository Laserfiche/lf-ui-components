// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTimeFieldComponent } from './date-time-field.component';
import { LfFieldBaseComponent } from '../lf-field-base/lf-field-base.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfTokenPickerComponent } from '../../lf-token-picker/lf-token-picker.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import {
  UniDateTimeComponent,
  LfUniDateTimeModule,
} from 'projects/ui-components/lf-metadata/lf-date-time-picker/uni-date-time.module';
import { UniDateTimeService } from 'projects/ui-components/lf-metadata/lf-date-time-picker/uni-date-time.service';

describe('DateTimeFieldComponent', () => {
  let requiredDateTimeComponent: DateTimeFieldComponent;
  let requiredDateTimeFixture: ComponentFixture<DateTimeFieldComponent>;

  let optionalDateTimeComponent: DateTimeFieldComponent;
  let optionalDateTimeFixture: ComponentFixture<DateTimeFieldComponent>;

  const requiredDateTime: LfFieldInfo = {
    name: 'requiredDateTimeName',
    id: 1,
    description: 'requiredDateTimeDescription',
    isRequired: true,
    fieldType: FieldType.DateTime,
    displayName: 'requiredDateTimeName',
  };

  const optionalDateTime: LfFieldInfo = {
    name: 'optionalDateTimeName',
    id: 2,
    description: 'optionalDateTimeDescription',
    fieldType: FieldType.DateTime,
    displayName: 'optionalDateTimeName',
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTimeFieldComponent, LfFieldBaseComponent, LfTokenPickerComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        ReactiveFormsModule,
        LfUniDateTimeModule,
      ],
      providers: [LfFieldTokenService, AppLocalizationService],
    }).compileComponents();
  }));

  beforeEach(() => {
    requiredDateTimeFixture = TestBed.createComponent(DateTimeFieldComponent);
    requiredDateTimeComponent = requiredDateTimeFixture.componentInstance;
    requiredDateTimeComponent.lf_field_info = requiredDateTime;
    requiredDateTimeComponent.lf_field_form_control = new FormControl();
    requiredDateTimeFixture.detectChanges();

    optionalDateTimeFixture = TestBed.createComponent(DateTimeFieldComponent);
    optionalDateTimeComponent = optionalDateTimeFixture.componentInstance;
    optionalDateTimeComponent.lf_field_info = optionalDateTime;
    optionalDateTimeComponent.lf_field_form_control = new FormControl();
    optionalDateTimeFixture.detectChanges();
  });

  it('should create required DateTime field', () => {
    expect(requiredDateTimeComponent).toBeTruthy();
  });

  it('should create optional DateTime field', () => {
    expect(optionalDateTimeComponent).toBeTruthy();
  });

  it('should have validation error if required field is blank', async () => {
    // assert
    requiredDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    const expectedBrokenRule = ValidationRule.REQUIRED;
    const expectedError = requiredDateTimeComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    expect(requiredDateTimeComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    requiredDateTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => {
        throw Error(`Timeout: value was ${value}`);
      }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not have validation error if optional field is blank', async () => {
    // assert
    expect(optionalDateTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    optionalDateTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => {
        throw Error(`Timeout: value was ${value}`);
      }
    );
    expect(value).toBeUndefined();
  });

  it('should not have validation error if optional field is valid', async () => {
    // arrange
    const validDateTimeValue = '2020-12-01T05:12:13';

    // act
    optionalDateTimeComponent.setLfFieldFormControlValue(validDateTimeValue);
    optionalDateTimeFixture.detectChanges();

    // assert
    expect(optionalDateTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    optionalDateTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => {
        throw Error(`Timeout: value was ${value}`);
      }
    );
    expect(value).toBeUndefined();
  });

  it('should not have validation error if required field is set to valid value', async () => {
    // arrange
    const validDateTimeValue = '2020-12-01T05:12:13';

    // act
    requiredDateTimeComponent.setLfFieldFormControlValue(validDateTimeValue);
    requiredDateTimeFixture.detectChanges();

    // assert
    expect(requiredDateTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    requiredDateTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => {
        throw Error(`Timeout: value was ${value}`);
      }
    );
    expect(value).toBeUndefined();
  });

  it('should have validation error if optional field is set to invalid value', async () => {
    // arrange
    const invalidDateTimeValue = 'a';
    const expectedBrokenRule = ValidationRule.DATETIME_PICKER_PARSE;
    const expectedDateFormat = 'MM/DD/YYYY';
    const expectedTimeFormat = 'hh:mm:ss';
    const expectedDateTimeFomrat = expectedDateFormat + ' ' + expectedTimeFormat;
    const returnedDateTimeObject = { component: new UniDateTimeComponent(new UniDateTimeService()) };
    returnedDateTimeObject.component.dateControl = new FormControl();
    returnedDateTimeObject.component.timeControl = new FormControl();
    returnedDateTimeObject.component.dateTimeControl = new FormControl();
    returnedDateTimeObject.component.settings = optionalDateTimeComponent.uniDateTimeSettings;
    returnedDateTimeObject.component.settings.timeFormat= expectedTimeFormat,
    returnedDateTimeObject.component.settings.dateFormat= expectedDateFormat,

    returnedDateTimeObject.component.dateControl.setValue(invalidDateTimeValue);

    // act
    optionalDateTimeComponent.onUniDateOrTimeChanged(returnedDateTimeObject);

    // assert
    const expectedError = optionalDateTimeComponent.localizationService.getString(
      'DATE_TIME_FIELDS_MUST_BE_IN_FORMAT_0',
      [expectedDateTimeFomrat]
    );
    expect(optionalDateTimeComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    optionalDateTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalDateTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => {
        throw Error(`Timeout: value was ${value}`);
      }
    );
    expect(value).toEqual(expectedError);
  });

  it('should serialize a valid value', () => {
    // arrange
    const validDateTimeValue = '2020-12-01T05:12:13';

    // act
    optionalDateTimeComponent.setLfFieldFormControlValue(validDateTimeValue);
    optionalDateTimeFixture.detectChanges();

    // assert
    const expectedValue: string = '2020-12-01T05:12:13';
    expect(optionalDateTimeComponent.serializeFieldFormControlValue()).toEqual(expectedValue);
  });

  it('should update locale when format error occurs', async () => {
    // arrange
    const expectedDateTimeFormat: string = 'DD/MM/YYYY H:mm';
    optionalDateTimeComponent.lf_field_form_control.setErrors({
      [ValidationRule.DATETIME_PICKER_PARSE]: { dateTimeFormat: expectedDateTimeFormat },
    });
    // act
    let actualValue: string | undefined;

    optionalDateTimeComponent.getValidationTextForFieldType(ValidationRule.DATETIME_PICKER_PARSE);
    //@ts-ignore
    optionalDateTimeComponent.LOCALE_DATE_TIME.subscribe((val) => {
      actualValue = val;
    });

    // assert
    await CoreUtils.waitForConditionAsync(
      () => actualValue === expectedDateTimeFormat,
      () => {
        throw Error(`Timeout: value was ${actualValue}`);
      }
    );
    expect(actualValue).toEqual(expectedDateTimeFormat);
  });
});
