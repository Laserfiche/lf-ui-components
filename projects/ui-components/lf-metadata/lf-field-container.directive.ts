import { ViewContainerRef, ComponentRef, Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LfFieldMetadataConnectorService } from './lf-field-metadata-connector.service';
import { AdhocFieldInfo } from './lf-field-adhoc-container/lf-field-adhoc-container-types';
import { LfFieldViewDirective } from './lf-field-view.directive';
import { LfFieldComponent } from './field-components/lf-field/lf-field.component';
import { LfFieldMultivalueComponent } from './field-components/lf-field-multivalue/lf-field-multivalue.component';
import { LfFieldGroupComponent } from './field-components/lf-field-group/lf-field-group.component';
import { FieldValue, FieldValues, LfFieldInfo, LfFieldValue, TemplateFieldInfo } from './field-components/utils/lf-field-types';

@Directive()
export abstract class LfFieldContainerDirective {

  @Output() fieldValuesChanged = new EventEmitter<boolean>();

  /** @internal */
  @ViewChild(LfFieldViewDirective) lfFieldView!: LfFieldViewDirective;
  /** @internal */
  componentRefs: ComponentRef<LfFieldComponent | LfFieldMultivalueComponent>[] = [];
  /** @internal */
  groupComponentRefs: ComponentRef<LfFieldGroupComponent>[] = [];
  /** @internal */
  allFieldInfos: (TemplateFieldInfo | LfFieldInfo | AdhocFieldInfo)[] = [];
  /** @internal */
  allFieldValues: FieldValues = {};
  /** @internal */
  private readonly VALUE_ACCESSOR = 'value';

  /** @internal */
  constructor(
    // /** @internal */
    // public viewContainerRef: ViewContainerRef,
    /** @internal */
    public metadataConnectorService: LfFieldMetadataConnectorService) { }

  /** @internal */
  abstract clearAsync(): Promise<void>;
  /** @internal */
  abstract onFieldValueChangedAsync(fieldValues: string[], lfFieldInfo: LfFieldInfo, indicesChanged?: number[]): Promise<void>;
  /** @internal */
  abstract renderFieldsAsync(fieldInfos: (TemplateFieldInfo | LfFieldInfo | AdhocFieldInfo)[]): Promise<void>;
  /** @internal */
  abstract multivalueComponentInitAsync(componentRef: ComponentRef<LfFieldMultivalueComponent>, fieldInfo: LfFieldInfo, stringValues: LfFieldValue[]): Promise<void>;
  /** @internal */
  abstract fieldComponentInitAsync(componentRef: ComponentRef<LfFieldComponent>, fieldInfo: LfFieldInfo, stringValues: LfFieldValue): Promise<void>;

  @Input()
  forceValidation = (): boolean => {
    let valid: boolean = true;
    this.componentRefs?.forEach((componentRef) => {
      if (!componentRef.instance.forceValidation()) {
        valid = false;
      }
    });
    this.groupComponentRefs?.forEach((componentRef) => {
      if (!componentRef.instance.forceValidation()) {
        valid = false;
      }
    });
    return valid;
  };

  /**
   * @internal
   * Returns whether container is valid without forcing validation
   */
  isValid(): boolean {
    const valid: boolean = this.componentRefs?.every((component) => component.instance.isValid()) ?? true;
    const groupsValid = this.groupComponentRefs?.every((component) => component.instance.isValid()) ?? true;
    return valid && groupsValid;
  }

  /** @internal */
  setFieldValue(fieldId: number, values: string[]): void {
    const fieldValue = this.getOrCreateFieldValue(fieldId);
    const formattedValues: { position: string; value: string }[] = values?.map((value, index) => {
      return { value, position: (index + 1).toString() };
    }) ?? [];
    if (formattedValues?.length > 0) {
      fieldValue.values = formattedValues;
    }
    this.allFieldValues[fieldId] = fieldValue;
    this.metadataConnectorService.setFieldValue(fieldValue);
  }

  /** @internal */
  getOrCreateFieldValue(fieldId: number): FieldValue {
    if (!(fieldId in this.allFieldValues)) {
      const val = this.createDefaultFieldValue(fieldId);
      this.allFieldValues[fieldId] = val;
      this.metadataConnectorService.setFieldValue(val);
    }
    return this.allFieldValues[fieldId];
  }

  /** @internal */
  protected async initializeFieldComponentAsync(
    fieldComponentRef: ComponentRef<LfFieldComponent>,
    fieldInfo: LfFieldInfo,
    value: string
  ) {
    await this.fieldComponentInitAsync(fieldComponentRef, fieldInfo, value);
    fieldComponentRef.instance.fieldValueChanged.subscribe(async (updatedValue: string) => {
      await this.onFieldValueChangedAsync([updatedValue], fieldComponentRef.instance.lfFieldInfo);
    });
  }

  /** @internal */
  protected async initializeMultivalueComponentAsync(
    multivalueComponentRef: ComponentRef<LfFieldMultivalueComponent>,
    fieldInfo: LfFieldInfo,
    stringValues: string[]
  ): Promise<void> {
    await this.multivalueComponentInitAsync(multivalueComponentRef, fieldInfo, stringValues);
    multivalueComponentRef.instance.fieldValuesChanged.subscribe(async (fieldChange: { fieldValues: string[]; indexChanged: number }) => {
      await this.onFieldValueChangedAsync(fieldChange.fieldValues, multivalueComponentRef.instance.lfFieldInfo, [fieldChange.indexChanged]);
    });
  }

  /** @internal */
  protected getValuesById(fieldId: number): string[] {
    const fieldValue: FieldValue = this.getOrCreateFieldValue(fieldId);
    const stringValues = fieldValue.values?.map((value) => {
      return value[this.VALUE_ACCESSOR];
    }) ?? [];
    return stringValues;
  }

  /** @internal */
  private createDefaultFieldValue(fieldId: number): FieldValue {
    const templateFieldInfo = this.allFieldInfos?.find((fieldInfo) => fieldInfo?.id === fieldId);
    if (!templateFieldInfo) {
      throw new Error(`createDefaultFieldValue: Field ${fieldId} not found`);
    }
    const defaultFieldValue = this.createFieldValueFromFieldInfo(templateFieldInfo);
    return defaultFieldValue;
  }

  /** @internal */
  private createFieldValueFromFieldInfo(field: LfFieldInfo): FieldValue {
    return { fieldName: field.name, fieldId: field.id, fieldType: field.fieldType };
  }

}
