// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFieldComponent } from './time-field.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { AppLocalizationService,ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfFieldTokenService } from '../lf-field-token.service';
import { FieldType, FieldFormat } from '@laserfiche/lf-ui-components/shared';
import { LfTokenPickerComponent } from '../../lf-token-picker/lf-token-picker.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { UniDateTimeComponent } from 'projects/ui-components/lf-metadata/lf-date-time-picker/uni-date-time.component';

describe('TimeFieldComponent', () => {
  let requiredTimeComponent: TimeFieldComponent;
  let requiredTimeFixture: ComponentFixture<TimeFieldComponent>;

  let optionalTimeComponent: TimeFieldComponent;
  let optionalTimeFixture: ComponentFixture<TimeFieldComponent>;

  const requiredTime: LfFieldInfo = {
    name: 'requiredTimeName',
    id: 1,
    description: 'requiredTimeDescription',
    isRequired: true,
    fieldType: FieldType.Time,
    format: FieldFormat.ShortTime,
    displayName: 'requiredTimeName'
  };

  const optionalTime: LfFieldInfo = {
    name: 'optionalTimeName',
    id: 2,
    description: 'optionalTimeDescription',
    fieldType: FieldType.Time,
    format: FieldFormat.LongTime,
    displayName: 'optionalTimeName'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimeFieldComponent,
        LfTokenPickerComponent,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        ReactiveFormsModule,
        UniDateTimeComponent,
      ],
      providers:[
        LfFieldTokenService,
        AppLocalizationService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    requiredTimeFixture = TestBed.createComponent(TimeFieldComponent);
    requiredTimeComponent = requiredTimeFixture.componentInstance;
    requiredTimeComponent.lf_field_info = requiredTime;
    requiredTimeComponent.lf_field_form_control = new FormControl();
    requiredTimeFixture.detectChanges();

    optionalTimeFixture = TestBed.createComponent(TimeFieldComponent);
    optionalTimeComponent = optionalTimeFixture.componentInstance;
    optionalTimeComponent.lf_field_info = optionalTime;
    optionalTimeComponent.lf_field_form_control = new FormControl();
    optionalTimeFixture.detectChanges();
  });

  it('should create required Time field', () => {
    expect(requiredTimeComponent).toBeTruthy();
  });

  it('should create optional Time field', () => {
    expect(optionalTimeComponent).toBeTruthy();
  });

  it('should have validation error if required field is blank', async () => {
    const expectedError = requiredTimeComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not have validation error if optional field is blank', async () => {
    expect(optionalTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    optionalTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should validate time pattern', async () => {
    // arrange
    const valueBadPattern: string = 'ds';

    // act
    requiredTimeComponent.setLfFieldFormControlValue(valueBadPattern);
    requiredTimeFixture.detectChanges();

    // assert
    const expectedBrokenRule = ValidationRule.TIME;
    const expectedError = requiredTimeComponent.localizationService.getString('TIME_FIELDS_MUST_BE_IN_FORMAT_0', ['hh:mm A']);
    expect(requiredTimeComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should update fieldFormControl dynamically', async () => {
    // arrange
    const validTime = '01:14:13 AM';

    // act
    requiredTimeComponent.setLfFieldFormControlValue(validTime);
    requiredTimeFixture.detectChanges();

    // assert
    expect(requiredTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should deserialize lfFieldValue as expected', () => {
    requiredTimeComponent.lf_field_value = 'test Value';
    const deserializedValue = requiredTimeComponent.deserializeLfFieldValue();
    expect(deserializedValue).toEqual('test Value');
  });

  it('should include seconds if format is LongTime', () => {
    expect(optionalTimeComponent.lf_field_info.format).toEqual(FieldFormat.LongTime);
    //@ts-ignore
    expect(optionalTimeComponent.timeDisplayFormat).toEqual('hh:mm:ss A');
  });

  it('should not include seconds if format is ShortTime', () => {
    expect(requiredTimeComponent.lf_field_info.format).toEqual(FieldFormat.ShortTime);
    //@ts-ignore
    expect(requiredTimeComponent.timeDisplayFormat).toEqual('hh:mm A');
  });

});
