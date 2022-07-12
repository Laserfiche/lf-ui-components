import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { DateFieldComponent } from './date-field.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import * as moment from 'moment';
import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';
import { FieldType, ValidationRule } from '@laserfiche/lf-ui-components/shared';
import { LfTokenPickerComponent } from '../../lf-token-picker/lf-token-picker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { CoreUtils } from '@laserfiche/lf-js-utils';

describe('DateFieldComponent', () => {
  let requiredDateComponent: DateFieldComponent;
  let requiredDateFixture: ComponentFixture<DateFieldComponent>;

  let optionalDateComponent: DateFieldComponent;
  let optionalDateFixture: ComponentFixture<DateFieldComponent>;

  const requiredDate: LfFieldInfo = {
    name: 'requiredDateName',
    id: 1,
    description: 'requiredDateDescription',
    isRequired: true,
    fieldType: FieldType.Date
  };

  const optionalDate: LfFieldInfo = {
    name: 'optionalDateName',
    id: 2,
    description: 'optionalDateDescription',
    isRequired: false,
    fieldType: FieldType.Date
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DateFieldComponent,
        LfTokenPickerComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        ReactiveFormsModule
      ],
      providers: [
        LfFieldTokenService,
        AppLocalizationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    requiredDateFixture = TestBed.createComponent(DateFieldComponent);
    requiredDateComponent = requiredDateFixture.componentInstance;
    requiredDateComponent.lf_field_info = requiredDate;
    requiredDateComponent.lf_field_form_control = new FormControl();
    requiredDateFixture.detectChanges();

    optionalDateFixture = TestBed.createComponent(DateFieldComponent);
    optionalDateComponent = optionalDateFixture.componentInstance;
    optionalDateComponent.lf_field_info = optionalDate;
    optionalDateComponent.lf_field_form_control = new FormControl();
    optionalDateFixture.detectChanges();
  });

  it('should create required Date field', () => {
    expect(requiredDateComponent).toBeTruthy();
  });

  it('should create optional Date field', () => {
    expect(optionalDateComponent).toBeTruthy();
  });

  it('should have validation error if required field is blank', async () => {
    // assert
    const expectedBrokenRule = ValidationRule.REQUIRED;
    const expectedError = requiredDateComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    expect(requiredDateComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    requiredDateComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredDateComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not have validation error if optional field is blank', async () => {
    // assert
    expect(optionalDateComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    optionalDateComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalDateComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should not have validation error if required field is set to valid value', async () => {
    // arrange
    const validDateValue = '2020-12-01';

    // act
    requiredDateComponent.setLfFieldFormControlValue(validDateValue);
    requiredDateFixture.detectChanges();

    // assert
    expect(requiredDateComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    requiredDateComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredDateComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should have validation error if optional field is set to invalid value', async () => {
    // arrange
    const invalidDateValue = 'a';

    // act
    optionalDateComponent.setLfFieldFormControlValue(invalidDateValue);
    optionalDateFixture.detectChanges();

    // assert
    const expectedBrokenRule = ValidationRule.MAT_DATEPICKER_PARSE;
    const expectedError = optionalDateComponent.localizationService.getString('DATE_FIELDS_MUST_BE_IN_FORMAT_0', ['MM/DD/YYYY']);
    expect(optionalDateComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    optionalDateComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalDateComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should respect en-us locale', async () => {
    // arrange
    const validDateValue = '2020-12-29';
    moment.locale('en-us');

    // act
    requiredDateComponent.setLfFieldFormControlValue(validDateValue);
    requiredDateComponent.onValueChanged();
    requiredDateFixture.detectChanges();

    // assert
    expect(requiredDateComponent.serializeFieldFormControlValue()).toEqual('2020-12-29T00:00:00');
    expect(requiredDateComponent.lf_field_value).toEqual('2020-12-29T00:00:00');
  });

  it('should respect en-gb locale', async () => {
    // arrange
    const validDateValue = '2020-12-29';
    moment.locale('en-gb');

    // act
    requiredDateComponent.setLfFieldFormControlValue(validDateValue);
    requiredDateComponent.onValueChanged();
    requiredDateFixture.detectChanges();

    // assert
    expect(requiredDateComponent.serializeFieldFormControlValue()).toEqual('2020-12-29T00:00:00');
    expect(requiredDateComponent.lf_field_value).toEqual('2020-12-29T00:00:00');
  });

  it('should detect token if field is token', async () => {
    // arrange
    const dateFieldWithToken = '%(date)';
    requiredDateComponent.setLfFieldFormControlValue(dateFieldWithToken);
    requiredDateComponent.onValueChanged();
    requiredDateFixture.detectChanges();

    // act
    const containsToken = requiredDateComponent.containsToken;

    // assert
    expect(containsToken).toBeTrue();
  });

  it('should not detect token if token does not exist in token list', async () => {
    // arrange
    const dateFieldWithInvalidToken = '%(dates)';
    optionalDateComponent.setLfFieldFormControlValue(dateFieldWithInvalidToken);
    optionalDateComponent.onValueChanged();
    optionalDateFixture.detectChanges();

    // act
    const containsToken = optionalDateComponent.containsToken;

    // assert
    expect(containsToken).toBeFalse();
  });

  it('should have update locale for date when language updated', async () => {
    // act
    let value: string | undefined;
    //@ts-ignore
    optionalDateComponent.LOCALE_DATE.subscribe((val) => {
      value = val;
    });
    await optionalDateComponent.localizationService.setLanguageAsync('es');

    // assert
    await CoreUtils.waitForConditionAsync(
      () => value === 'DD/MM/YYYY',
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual('DD/MM/YYYY');
  });
});
