import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { Observable, of } from 'rxjs';
import { ChecklistItem } from './checklist-item';
import { ItemsValidationTextPipe } from './items-validation-text.pipe';

describe('ItemsValidationTextPipe', () => {
  const mappedObservables: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['REQUIRED', of('required')]
  ]);
  const mappedObservablesNoRequired: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['TEST', of('test')]
  ]);
  const pipe = new ItemsValidationTextPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return localized string if no requiredError', async () => {
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true
    };
    const testForm: AbstractControl = new FormControl('test form');
    testForm.setValidators(Validators.required);
    testForm.setValue('');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservables).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();
    const expectedValue = 'required';

    await CoreUtils.waitForConditionAsync(
      () => value === expectedValue,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedValue);
  });

  it('should return undefined if no localized string and no requiredError', async () => {
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true
    };
    const testForm: AbstractControl = new FormControl('test form');
    testForm.setValidators(Validators.required);
    testForm.setValue('');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservablesNoRequired).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();

    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined;
  });

  it('should return no error if no validators on form', async () => {
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true
    };
    const testForm: AbstractControl = new FormControl('test form');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservables).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();

    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should return requiredError if required field is empty and requiredError exists', async () => {
    const expected: string = 'item is required';
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true,
      requiredError: expected
    };
    const testForm: AbstractControl = new FormControl('test form');
    testForm.setValidators(Validators.required);
    testForm.setValue('');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservables).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();

    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });

  it('should return constraintError if field does not follow constraint', async () => {
    const expected: string = 'item is constrained';
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true,
      constraintError: expected
    };
    const testForm: AbstractControl = new FormControl('test form');
    testForm.setValidators(Validators.pattern('^\d$'));
    testForm.setValue('aa');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservables).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();

    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });

  it('should return constraintError if field does not follow constraint and localizedString does not exist', async () => {
    const expected: string = 'item is constrained';
    const item: ChecklistItem = {
      checked: true,
      id: '1',
      name: 'test',
      icon: 'test',
      disabled: false,
      editable: true,
      constraintError: expected
    };
    const testForm: AbstractControl = new FormControl('test form');
    testForm.setValidators(Validators.pattern('^\d$'));
    testForm.setValue('aa');
    let value: string | undefined;
    pipe.transform(item, testForm, mappedObservablesNoRequired).subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    testForm.updateValueAndValidity();

    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });
});
