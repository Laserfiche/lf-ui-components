import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { FieldDefinition } from '../utils/lf-field-internal-types';
import { FieldValue, TemplateFieldInfo } from '../utils/lf-field-types';
import { isDynamicField } from '../utils/metadata-utils';

@Component({
  selector: 'lf-field-group-component',
  templateUrl: './lf-field-group.component.html',
  styleUrls: ['./lf-field-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LfFieldGroupComponent {
  /** @internal */
  fieldDefinitions: FieldDefinition[] = [];
  /** @internal */
  fieldGroups: FormArray;
  /** @internal */
  fieldValues: Map<number, FieldValue> = new Map<number, FieldValue>();
  /** @internal */
  groupId: number = 0;
  /** @internal */
  dynamicFieldOptions: Map<number, string[][]> | undefined;

  /** @internal */
  @Output() fieldValuesChanged = new EventEmitter<{ fieldValue: FieldValue; indicesChanged?: number[] }>();
  /** @internal */
  showLoaderIndex: number | undefined = undefined;

  /** @internal */
  readonly res_0_of_1 = this.localizationService.getStringLaserficheObservable('0_OF_1', ['{0}', '{1}']);

  /** @internal */
  constructor(
    /** @internal */
    private fb: FormBuilder,
    /** @internal */
    private cdr: ChangeDetectorRef,
    /** @internal */
    public localizationService: AppLocalizationService
  ) {
    this.fieldGroups = this.fb.array([]);
  }

  /** @internal */
  @Input()
  getFieldValues = (): Map<number, FieldValue> => {
    return this.fieldValues;
  };

  /** @internal */
  @Input()
  initAsync = async (
    fieldDefinitions: FieldDefinition[],
    dynamicFieldOptions?: Map<number, string[][]>
  ): Promise<void> => {
    this.fieldDefinitions = fieldDefinitions ?? [];
    this.groupId = fieldDefinitions[0]?.fieldInfo?.groupId ?? 0;
    this.dynamicFieldOptions = dynamicFieldOptions;
    this.setFieldGroups(fieldDefinitions);
    this.cdr.detectChanges();
  };

  /** @internal */
  getOptions(fieldInfo: TemplateFieldInfo, index: number) {
    const optionsForFieldInfo = this.dynamicFieldOptions?.get(fieldInfo.id);
    const options = optionsForFieldInfo ? optionsForFieldInfo[index] : undefined;
    return options;
  }

  /** @internal */
  @Input()
  forceValidation: () => boolean = () => {
    let isValid: boolean = true;
    const groups = this.fieldGroupControlsArray();
    groups.forEach((group) => {
      this.fieldDefinitions.forEach((definition) => {
        const fieldInfo = definition.fieldInfo;
        const control = group.get(fieldInfo.id.toString());
        control?.markAsDirty();
        control?.updateValueAndValidity();
        const valid = control?.valid;
        if (!valid) {
          isValid = false;
        }
      });
    });
    return isValid;
  };

  /** @internal */
  isLoading(fieldInfo: TemplateFieldInfo, currentIndex: number): boolean {
    if (this.showLoaderIndex !== undefined) {
      if (currentIndex === this.showLoaderIndex && isDynamicField(fieldInfo)) {
        return true;
      }
    }
    return false;
  }

  /** @internal */
  @Input()
  showLoader(index: number) {
    this.showLoaderIndex = index;
    this.cdr.detectChanges();
  }

  /** @internal */
  private setFieldGroups(fieldDefinitions: FieldDefinition[]) {
    this.fieldGroups.clear();
    const numGroups = fieldDefinitions[0].fieldValues?.length ?? 1;
    for (let fieldNumber = 0; fieldNumber < numGroups; fieldNumber++) {
      const formGroup: FormGroup = new FormGroup({});
      fieldDefinitions.forEach((fieldDef) => {
        if (fieldDef.fieldValues && fieldDef.fieldValues.length !== numGroups) {
          // TODO localize
          throw new Error('Number of fieldValues is not ' + numGroups + ' for fieldId: ' + fieldDef.fieldInfo.id);
        }
        if (fieldDef.fieldInfo.fieldType === FieldType.Blob) {
          console.warn('Blob field not supported');
        } else if (!(fieldDef.fieldInfo.fieldType in FieldType)) {
          throw new Error('FieldType not supported.');
        } else {
          this.addFieldFormControl(fieldDef, fieldNumber, formGroup);
        }
      });
      this.fieldGroups.push(formGroup);
    }
  }

  /** @internal */
  private addFieldFormControl(fieldDef: FieldDefinition, fieldNumber: number, formGroup: FormGroup) {
    const fieldValues = fieldDef.fieldValues;
    const fieldValue = fieldValues ? fieldValues[fieldNumber] : '';
    const fieldInfo = fieldDef.fieldInfo;

    let initialValue: string | undefined;
    if (fieldValue && fieldValue.length > 0) {
      initialValue = fieldValue;
    } else if (fieldInfo.defaultValue) {
      initialValue = fieldInfo.defaultValue;
    }

    this.updateFieldValues(fieldInfo, initialValue, fieldNumber);
    const formControl = new FormControl(initialValue ?? '');
    formGroup.addControl(fieldInfo.id.toString(), formControl);
  }

  /** @internal */
  private updateFieldValues(fieldInfo: TemplateFieldInfo, initialValue: string | undefined, fieldNumber: number) {
    const prevValues = this.fieldValues.get(fieldInfo.id);
    const newValue = { value: initialValue ?? '', position: (fieldNumber + 1).toString() };
    if (prevValues) {
      prevValues.values?.push(newValue);
    } else {
      const newConfig: FieldValue = {
        fieldName: fieldInfo.name,
        fieldId: fieldInfo.id,
        fieldType: fieldInfo.fieldType,
        groupId: fieldInfo.groupId ?? 0,
        values: [newValue],
      };
      this.fieldValues.set(fieldInfo.id, newConfig);
    }
  }

  /** @internal */
  fieldDataChange(event: string, fieldInfo: TemplateFieldInfo, indexChanged: number) {
    const fieldValue = this.fieldValues.get(fieldInfo.id);
    if (fieldValue?.values) {
      fieldValue.values[indexChanged]['value'] = event;
    }
    if (fieldValue) {
      this.fieldValuesChanged.emit({ fieldValue, indicesChanged: [indexChanged] });
    }
  }

  /** @internal */
  getSingleField(index: number, fieldId: number): AbstractControl | null {
    const group = this.fieldGroupControlsArray()[index];
    const field = group.get(fieldId.toString());
    return field;
  }

  /** @internal */
  isValid(): boolean {
    let isValid: boolean = true;
    const groups = this.fieldGroupControlsArray();
    groups.forEach((group) => {
      this.fieldDefinitions.forEach((definition) => {
        const fieldInfo = definition.fieldInfo;
        const control = group.get(fieldInfo.id.toString());
        const valid = control?.valid;
        if (!valid) {
          isValid = false;
        }
      });
    });
    return isValid;
  }

  /** @internal */
  onDragAndDrop(event: CdkDragDrop<string[]>) {
    const first: number = Math.min(event.previousIndex, event.currentIndex);
    const last: number = Math.max(event.previousIndex, event.currentIndex);
    const indicesChanged: number[] = [];
    for (let tracker = first; tracker <= last; tracker++) {
      indicesChanged.push(tracker);
    }
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.fieldDefinitions.forEach((fieldDef) => {
      const fieldInfo = fieldDef.fieldInfo;
      const fieldValue = this.fieldValues.get(fieldInfo.id);
      moveItemInArray(fieldValue?.values ?? [], event.previousIndex, event.currentIndex);
      this.resetPositionValues(fieldValue);
      if (fieldValue) {
        this.fieldValuesChanged.emit({ fieldValue, indicesChanged });
      }
    });
  }

  /** @internal */
  fieldGroupControlsArray() {
    return this.fieldGroups.controls;
  }

  /** @internal */
  onClickDelete(index: number) {
    this.fieldGroups.removeAt(index);
    const numIndices = this.fieldGroupControlsArray().length;
    const indicesChanged: number[] = [];
    for (let tracker = index; tracker <= numIndices; tracker++) {
      indicesChanged.push(tracker);
    }
    this.fieldValues.forEach((fieldValue) => {
      fieldValue.values?.splice(index, 1);
      this.resetPositionValues(fieldValue);
      if (fieldValue) {
        this.fieldValuesChanged.emit({ fieldValue, indicesChanged });
      }
    });
  }

  /** @internal */
  private resetPositionValues(fieldValue: FieldValue | undefined) {
    fieldValue?.values?.forEach((value, currIndex) => {
      value['position'] = (currIndex + 1).toString();
    });
  }

  /** @internal */
  onClickAdd(currentIndex: number) {
    const formGroup: FormGroup = new FormGroup({});
    const numIndices = this.fieldGroupControlsArray().length + 1;
    const indicesChanged: number[] = [];
    for (let tracker = currentIndex + 1; tracker <= numIndices; tracker++) {
      indicesChanged.push(tracker);
    }
    this.fieldDefinitions.forEach((fieldDef) => {
      const fieldInfo = fieldDef.fieldInfo;
      const fieldValue = this.fieldValues.get(fieldInfo.id);
      let val: string | undefined;
      if (fieldInfo.defaultValue) {
        val = fieldInfo.defaultValue;
      }
      const newValue = {
        value: val ?? '',
        position: (currentIndex + 2).toString(),
      };
      fieldValue?.values?.splice(currentIndex + 1, 0, newValue);
      this.resetPositionValues(fieldValue);
      const formControl = new FormControl(val ?? '');
      formGroup.addControl(fieldInfo.id.toString(), formControl);
      if (fieldValue) {
        this.fieldValuesChanged.emit({ fieldValue, indicesChanged });
      }
    });
    this.fieldGroups.insert(currentIndex + 1, formGroup);
    this.cdr.detectChanges();
  }

  /** @internal */
  onClickUp(currentIndex: number) {
    moveItemInArray(this.fieldGroupControlsArray(), currentIndex, currentIndex - 1);
    this.fieldDefinitions.forEach((fieldDef) => {
      const fieldInfo = fieldDef.fieldInfo;
      const fieldValue = this.fieldValues.get(fieldInfo.id);
      const prevOne = fieldValue?.values ? fieldValue.values[currentIndex - 1] : {};
      prevOne['position'] = (Number.parseInt(prevOne['position']) + 1).toString();
      const thisOne = fieldValue?.values ? fieldValue.values[currentIndex] : {};
      thisOne['position'] = (Number.parseInt(thisOne['position']) - 1).toString();
      moveItemInArray(fieldValue?.values ?? [], currentIndex, currentIndex - 1);
      if (fieldValue) {
        this.fieldValuesChanged.emit({ fieldValue, indicesChanged: [currentIndex, currentIndex - 1] });
      }
    });
  }

  /** @internal */
  onClickDown(currentIndex: number) {
    moveItemInArray(this.fieldGroupControlsArray(), currentIndex, currentIndex + 1);
    this.fieldDefinitions.forEach((fieldDef) => {
      const fieldInfo = fieldDef.fieldInfo;
      const fieldValue = this.fieldValues.get(fieldInfo.id);
      const nextOne = fieldValue?.values ? fieldValue.values[currentIndex + 1] : {};
      nextOne['position'] = (Number.parseInt(nextOne['position']) - 1).toString();
      const thisOne = fieldValue?.values ? fieldValue.values[currentIndex] : {};
      thisOne['position'] = (Number.parseInt(thisOne['position']) + 1).toString();
      moveItemInArray(fieldValue?.values ?? [], currentIndex, currentIndex + 1);
      if (fieldValue) {
        this.fieldValuesChanged.emit({ fieldValue, indicesChanged: [currentIndex, currentIndex + 1] });
      }
    });
  }
}
