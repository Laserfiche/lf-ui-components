import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { FieldValue, LfFieldInfo, LfFieldValue } from '../utils/lf-field-types';

@Component({
  selector: 'lf-field-multivalue-component',
  templateUrl: './lf-field-multivalue.component.html',
  styleUrls: ['./lf-field-multivalue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LfFieldMultivalueComponent {

  /** @internal */
  lfFieldInfo!: LfFieldInfo;
  /** @internal */
  lfFieldValues: LfFieldValue[] = [];
  /** @internal */
  multiValueFieldParentForm: FormGroup;
  /** @internal */
  showLoader: boolean = false;

  /** @internal */
  @Output() fieldValuesChanged = new EventEmitter<{ fieldValues: LfFieldValue[]; indexChanged: number }>();
  /** @internal */
  dynamicFieldOptions: string[][] | undefined;
  /** @internal */
  showField: boolean = false;

  /** @internal */
  constructor(
    /** @internal */
    private fb: FormBuilder,
    /** @internal */
    private cdr: ChangeDetectorRef) {
    this.multiValueFieldParentForm = this.fb.group({
      fieldArray: new FormArray([])
    });
  }

  /** @internal */
  private getArray(): FormArray {
    return this.multiValueFieldParentForm.get('fieldArray') as FormArray;
  }

  /** @internal */
  getSingleField(index: number): FormControl {
    return this.getArray().controls[index] as FormControl;
  }

  /** @internal */
  getLfFieldInfo(currentIndex: number): LfFieldInfo {
    if (currentIndex === 0) {
      return this.lfFieldInfo;
    }
    else {
      const optional = Object.assign({}, this.lfFieldInfo);
      optional.isRequired = false;
      return optional;
    }
  }

  /** @internal */
  isValid(): boolean {
    return this.multiValueFieldParentForm.valid;
  }

  /** @internal */
  @Input()
  initAsync = async (fieldDefinition: LfFieldInfo, fieldValues: LfFieldValue[] = [], dynamicFieldOptions?: string[][]): Promise<void> => {
    this.lfFieldInfo = CoreUtils.validateDefined(fieldDefinition, 'fieldDefinition');
    this.dynamicFieldOptions = dynamicFieldOptions;
    if(this.lfFieldInfo.fieldType === FieldType.Blob) {
      console.warn('Blob field not supported');
    }
    else if(!(this.lfFieldInfo.fieldType in FieldType)) {
      throw new Error('FieldType not supported.');
    }
    else {
      this.showField = true;
    }
    if ((!fieldValues || fieldValues.length === 0) && this.lfFieldInfo.defaultValue) {
      this.lfFieldValues = [this.lfFieldInfo.defaultValue];
    }
    else {
      this.lfFieldValues = fieldValues.filter(val => val !== undefined && val.trim().length > 0);
    }
    this.syncFormControlDataToFieldValues();

    if (!this.isValid()) {
      this.removeInvalidFieldValues();
    }
  };

  /** @internal */
  @Input()
  forceValidation: () => boolean = () => {
    this.getArray().controls.forEach(control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    return this.isValid();
  };

  /** @internal */
  private removeInvalidFieldValues() {
    this.getArray().controls.forEach((control, index) => {
      const value = control.value;
      if (!control.valid && value && value.trim().length > 0) {
        control.setValue('');
        this.lfFieldValues[index] = '';
      }
    });
    if (this.isValid()) {
      this.lfFieldValues = this.lfFieldValues.filter(value => value && value.trim().length > 0);
      this.syncFormControlDataToFieldValues();
    }
  }

  /** @internal */
  getOptions() {
    const options = (this.dynamicFieldOptions && this.dynamicFieldOptions.length > 0) ? this.dynamicFieldOptions[0] : undefined;
    return options;
  }

  /** @internal */
  syncFormControlDataToFieldValues() {
    this.getArray().clear();
    if (this.lfFieldValues) {
      this.lfFieldValues.forEach(val => {
        this.getArray().push(new FormControl(val));
      });
      if (this.lfFieldValues.length === 0 || this.lfFieldValues[this.lfFieldValues.length - 1] !== undefined) {
        this.addNewBlankField();
      }
    }
    this.cdr.detectChanges();
  }

  /** @internal */
  @Input()
  getFieldValue: () => FieldValue = () => {
    // Clean up blank inputs if valid
    if (this.isValid()) {
      this.lfFieldValues = this.lfFieldValues.filter(value => value && value.trim().length > 0);
      this.syncFormControlDataToFieldValues();
    }

    let fieldValues = this.lfFieldValues.filter(value => value && value.trim().length > 0).map((lfFieldValue, index) => {
      return {
        value: lfFieldValue,
        position: (index + 1).toString()
      };
    });

    if (fieldValues?.length === 0) {
      fieldValues = [{ value: '', position: '1' }];
    }

    const fieldVal: FieldValue = {
      fieldName: this.lfFieldInfo.name,
      fieldId: this.lfFieldInfo.id,
      fieldType: this.lfFieldInfo?.fieldType,
      values: fieldValues
    };

    return fieldVal;
  };

  /** @internal */
  onChange(value: LfFieldValue, indexChanged: number) {
    this.lfFieldValues[indexChanged] = value;
    const isValidMultiValueFieldValue = this.isLastInArray(indexChanged) && this.fieldHasValue(value) && this.lastValueIsValid();
    if (isValidMultiValueFieldValue) {
      this.addNewBlankField();
    }
    this.fieldValuesChanged.emit({ fieldValues: this.lfFieldValues, indexChanged });
    this.cdr.detectChanges();
  }

  /** @internal */
  private lastValueIsValid() {
    const lastIndex: number = this.getArray().length - 1;
    return this.getArray().controls[lastIndex].valid;
  }

  /** @internal */
  private fieldHasValue(value: string) {
    return value?.trim().length > 0;
  }

  /** @internal */
  private isLastInArray(index: number) {
    return index === this.getArray().length - 1;
  }

  /** @internal */
  private addNewBlankField() {
    this.lfFieldValues.push('');
    this.getArray().push(new FormControl(''));

    // Hack: if the field is required, and the value above is deleted,
    // this one will immediately show required error even if not touched by user
    const lastIndex: number = this.getArray().length - 1;
    if (lastIndex !== 0) {
      this.getArray().controls[lastIndex].markAsDirty();
    }
    this.cdr.detectChanges();
  }

  /** @internal */
  removeField(indexChanged: number) {
    this.lfFieldValues.splice(indexChanged, 1);
    this.getArray().removeAt(indexChanged);
    this.cdr.detectChanges();
    this.fieldValuesChanged.emit({ fieldValues: this.lfFieldValues, indexChanged });
  }

  /** @internal */
  trackByIndex(index: number, option: string) {
    const res = `${index}${option}`;
    return res;
  }

  /** @internal */
  get isLoading(): boolean {
    return this.showLoader;
  }

  /** @internal */
  set isLoading(val: boolean) {
    this.showLoader = val;
    this.cdr.detectChanges();
  }

}
