import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { FieldValue, LfFieldInfo, LfFieldValue } from '../utils/lf-field-types';

@Component({
  selector: 'lf-field-component',
  templateUrl: './lf-field.component.html',
  styleUrls: ['./lf-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LfFieldComponent {

  /** @internal */
  lfFieldInfo!: LfFieldInfo;
  /** @internal */
  lfFieldValue: LfFieldValue = '';
  /** @internal */
  singleFieldParentForm: FormGroup;
  /** @internal */
  showLoader: boolean = false;

  /** @internal */
  @Output() fieldValueChanged = new EventEmitter<string>();
  /** @internal */
  dynamicFieldValueOptions: string[] | undefined;
  /** @internal */
  showField: boolean = false;

  /** @internal */
  constructor(
    /** @internal */
    private fb: FormBuilder,
    /** @internal */
    private cdr: ChangeDetectorRef) {
    this.singleFieldParentForm = this.fb.group({
      singleField: [this.lfFieldValue]
    });
  }

  /** @internal */
  getSingleField(): FormControl {
    return this.singleFieldParentForm.get('singleField') as FormControl;
  }

  /** @internal */
  isValid(): boolean {
    return this.singleFieldParentForm.valid;
  }

  /** @internal */
  @Input()
  forceValidation = (): boolean => {
    this.getSingleField().markAsDirty();
    this.getSingleField().updateValueAndValidity();
    return this.isValid();
  };

  /** @internal */
  getOptions() {
    const options = this.dynamicFieldValueOptions;
    return options;
  }

  /** @internal */
  @Input()
  initAsync = async (field: LfFieldInfo, fieldValue: LfFieldValue = '', dynamicFieldValueOptions?: string[]): Promise<void> => {
    this.lfFieldInfo = CoreUtils.validateDefined(field, 'field');
    this.lfFieldValue = this.getInitialValue(fieldValue);
    if(this.lfFieldInfo.fieldType === FieldType.Blob) {
      console.warn('Blob field not supported');
    }
    else if(!(this.lfFieldInfo.fieldType in FieldType)) {
      throw new Error('FieldType not supported.');
    }
    else {
      this.showField = true;
    }
    this.dynamicFieldValueOptions = dynamicFieldValueOptions;
    this.cdr.detectChanges();
    this.removeInvalidFieldValues(this.lfFieldValue);
  };

  /** @internal */
  private removeInvalidFieldValues(fieldValue: string) {
    const isValid = this.isValid();
    if (!isValid) {
      this.getSingleField().setValue('');
      fieldValue = '';
      this.lfFieldValue = fieldValue;
      this.cdr.detectChanges();
    }
  }

  /** @internal */
  private getInitialValue(fieldValue: string): string {
    if (!fieldValue || fieldValue.length === 0) {
      const defaultValue = this.lfFieldInfo.defaultValue;
      if (defaultValue) {
        fieldValue = defaultValue;
      }
    }
    return fieldValue ?? '';
  }

  /** @internal */
  @Input()
  getFieldValue = (): FieldValue => {
    const fieldVal: FieldValue = {
      fieldName: this.lfFieldInfo.name,
      fieldId: this.lfFieldInfo.id,
      fieldType: this.lfFieldInfo.fieldType,
      values: [
        {
          value: this.lfFieldValue,
          position: '1'
        }
      ]
    };
    return fieldVal;
  };

  /** @internal */
  fieldDataChange(value: LfFieldValue) {
    this.lfFieldValue = value;
    this.fieldValueChanged.emit(value);
    this.cdr.detectChanges();
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
